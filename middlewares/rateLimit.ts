import { createHash } from 'node:crypto';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import rateLimit, { ipKeyGenerator, MemoryStore } from 'express-rate-limit';
import type {
  Options,
  RateLimitRequestHandler,
  Store,
} from 'express-rate-limit';
import { createRedisStore, rateLimitConfig } from '@/config/rateLimit';

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

// Generated API keys are 100 lowercase hex characters (see generateApiKey).
const API_KEY_PATTERN = /^[a-f0-9]{100}$/i;

const EXEMPT_PATHS = ['/api/health', '/api/version', '/api/info'];
const ENTITY_PATHS = ['/api/v1/dynasties', '/api/v1/rulers', '/api/v1/wars'];
const USERS_PATH = '/api/v1/users';

const registeredStores: (Store | undefined)[] = [];

// express-rate-limit attaches the counter result to the request, but its
// declaration merging does not apply to the Express 5 type definitions.
type RateLimitedRequest = Request & {
  rateLimit?: { resetTime?: Date };
};

/**
 * Checks whether the request carries an API key in the expected format.
 *
 * Malformed keys are deliberately treated like anonymous traffic so that
 * guessing random keys cannot mint a fresh quota bucket per attempt.
 *
 * @param request Default Express request object
 * @returns True when the x-api-key header is a well formed key
 */
export function hasWellFormedApiKey(request: Request): boolean {
  const apiKey = request.get('x-api-key')?.trim();

  return Boolean(apiKey && API_KEY_PATTERN.test(apiKey));
}

/**
 * Builds the opaque Redis key for an API key so raw keys are never stored.
 *
 * @param request Default Express request object
 * @returns A hashed key prefixed to separate it from IP keyed buckets
 */
export function apiKeyFingerprint(request: Request): string {
  const apiKey = request.get('x-api-key')?.trim() ?? '';

  return `key:${createHash('sha256').update(apiKey).digest('hex')}`;
}

/**
 * Derives the client identity from the request IP, with IPv6 subnet handling.
 *
 * @param request Default Express request object
 * @returns A prefixed IP key
 */
function ipFingerprint(request: Request): string {
  return `ip:${ipKeyGenerator(request.ip ?? 'unknown')}`;
}

/**
 * Returns the path portion of the request URL without the query string.
 *
 * @param request Default Express request object
 * @returns The request path
 */
function requestPath(request: Request): string {
  return request.originalUrl.split('?')[0] ?? '';
}

/**
 * Checks whether a path matches one of the given prefixes.
 *
 * @param path Request path
 * @param prefixes Route prefixes to compare against
 * @returns True when the path equals or extends one of the prefixes
 */
function matchesPrefix(path: string, prefixes: readonly string[]): boolean {
  return prefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function isPreflight(request: Request): boolean {
  return request.method === 'OPTIONS';
}

function isExemptPath(request: Request): boolean {
  return matchesPrefix(requestPath(request), EXEMPT_PATHS);
}

function skipEverything(request: Request): boolean {
  return isPreflight(request) || isExemptPath(request);
}

function skipGlobalAnonymous(request: Request): boolean {
  const path = requestPath(request);

  return (
    skipEverything(request) ||
    matchesPrefix(path, [USERS_PATH]) ||
    matchesPrefix(path, ENTITY_PATHS)
  );
}

function skipEntityAnonymous(request: Request): boolean {
  return skipEverything(request) || hasWellFormedApiKey(request);
}

function skipEntityApiKey(request: Request): boolean {
  return skipEverything(request) || !hasWellFormedApiKey(request);
}

function skipUsers(request: Request): boolean {
  return skipEverything(request);
}

/**
 * Sends the shared 429 response used by every tier.
 *
 * @param request Default Express request object
 * @param response Default Express response object
 * @param _next Unused Express next function
 * @param options The limiter options, used to derive the retry window
 */
function handleLimitReached(
  request: Request,
  response: Response,
  _next: NextFunction,
  options: Options,
) {
  const resetTime = (request as RateLimitedRequest).rateLimit?.resetTime;
  const retryAfter = resetTime
    ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
    : Math.max(1, Math.ceil(options.windowMs / 1000));

  response.setHeader('Retry-After', String(retryAfter));
  response.status(429).json({
    success: false,
    message: 'Too many requests. Please slow down and try again later.',
    retryAfter,
  });
}

export type TierDefinition = {
  name: string;
  perMinute: number;
  perDay: number;
  minuteWindowMs?: number;
  dayWindowMs?: number;
  keyGenerator?: (request: Request, response: Response) => string;
  skip?: (request: Request, response: Response) => boolean;
  storeFactory?: (prefix: string) => Store | undefined;
};

/**
 * Builds one limiter for a tier window.
 *
 * @param tier Tier definition
 * @param windowMs Window length in milliseconds
 * @param limit Allowed requests within the window
 * @param window Label used to namespace the store prefix
 * @returns A configured Express request handler
 */
function buildLimiter(
  tier: TierDefinition,
  windowMs: number,
  limit: number,
  window: string,
): RateLimitRequestHandler {
  const prefix = `itihaas:ratelimit:${rateLimitConfig.environment}:${tier.name}:${window}`;
  const store =
    (tier.storeFactory ?? createRedisStore)(prefix) ?? new MemoryStore();

  registeredStores.push(store);

  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    passOnStoreError: true,
    keyGenerator: tier.keyGenerator ?? ipFingerprint,
    handler: handleLimitReached,
    skip: (request, response) =>
      isPreflight(request) || (tier.skip?.(request, response) ?? false),
    store,
  });
}

/**
 * Builds the minute and day limiter pair for a tier.
 *
 * Both limiters run in sequence, so a request must stay inside the per-minute
 * and per-day budgets at the same time.
 *
 * @param tier Tier definition
 * @returns The minute limiter followed by the day limiter
 */
export function createTier(tier: TierDefinition): RateLimitRequestHandler[] {
  return [
    buildLimiter(
      tier,
      tier.minuteWindowMs ?? MINUTE_MS,
      tier.perMinute,
      'minute',
    ),
    buildLimiter(tier, tier.dayWindowMs ?? DAY_MS, tier.perDay, 'day'),
  ];
}

/**
 * Clears every registered store. Intended for tests only.
 */
export async function resetRateLimits(): Promise<void> {
  await Promise.all(
    registeredStores.map(async (store) => {
      if (store?.resetAll) {
        await store.resetAll();
      }
    }),
  );
}

// Anonymous traffic: any request that is not on a stricter route.
export const anonymousTier = createTier({
  name: 'anonymous',
  perMinute: rateLimitConfig.anonymous.perMinute,
  perDay: rateLimitConfig.anonymous.perDay,
  skip: skipGlobalAnonymous,
});

// Account endpoints: a stricter per-IP budget that replaces the anonymous one.
export const usersTier = createTier({
  name: 'users',
  perMinute: rateLimitConfig.users.perMinute,
  perDay: rateLimitConfig.users.perDay,
  skip: skipUsers,
});

// Entity routes without a usable API key fall back to the anonymous budget.
export const entityAnonymousTier = createTier({
  name: 'entities-anonymous',
  perMinute: rateLimitConfig.anonymous.perMinute,
  perDay: rateLimitConfig.anonymous.perDay,
  skip: skipEntityAnonymous,
});

// Entity routes with a well formed API key get their own per-key budget.
export const apiKeyTier = createTier({
  name: 'entities-api-key',
  perMinute: rateLimitConfig.apiKey.perMinute,
  perDay: rateLimitConfig.apiKey.perDay,
  keyGenerator: apiKeyFingerprint,
  skip: skipEntityApiKey,
});

export const rateLimitPaths = {
  entities: ENTITY_PATHS,
  users: USERS_PATH,
} as const;

export type { RequestHandler };

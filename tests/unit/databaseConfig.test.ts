import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const connectMock = vi.hoisted(() => vi.fn());
const useDbMock = vi.hoisted(() => vi.fn());

vi.mock('mongoose', () => ({
  default: {
    connect: connectMock,
    connection: { useDb: useDbMock },
  },
}));

type ConfigModule = {
  default: (uri?: string) => Promise<unknown>;
  getContributionsConnection: () => unknown;
  getUsersConnection: () => unknown;
};

/**
 * The module reads env vars and calls dotenv on load, so each test needs a
 * fresh copy. The specifier is cast to `string` so tsc does not re-resolve it
 * (the alias mapping only covers static imports); the literal string survives
 * compilation, so Vite still applies the `@` alias at runtime.
 */
async function loadConfig(): Promise<ConfigModule> {
  return (await import('@/database/config' as string)) as ConfigModule;
}

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  connectMock.mockReset();
  useDbMock.mockReset();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('createDatabaseConnection', () => {
  it('rejects when no connection string is configured', async () => {
    const { default: createDatabaseConnection } = await loadConfig();

    // Delete after importing: the module runs dotenv.config() on load
    delete process.env['MONGO_DB_CONNECTION_STRING'];

    await expect(createDatabaseConnection()).rejects.toThrow(
      'MONGO_DB_CONNECTION_STRING is not correctly configured',
    );
    expect(connectMock).not.toHaveBeenCalled();
  });

  it('connects to the base database with default database names', async () => {
    delete process.env['MONGO_DB_BASE_DATABASE'];
    delete process.env['MONGO_DB_CONTRIBUTIONS_DATABASE'];
    delete process.env['MONGO_DB_USERS_DATABASE'];

    const connection = { connection: { host: 'localhost' } };
    connectMock.mockResolvedValue(connection);
    useDbMock.mockImplementation((name: string) => ({ name }));

    const { default: createDatabaseConnection } = await loadConfig();

    const result = await createDatabaseConnection('mongodb://localhost:27017');

    expect(connectMock).toHaveBeenCalledWith('mongodb://localhost:27017', {
      dbName: 'itihaas',
    });
    expect(useDbMock).toHaveBeenCalledWith('contributions', { useCache: true });
    expect(useDbMock).toHaveBeenCalledWith('users', { useCache: true });
    expect(result).toBe(connection);
  });

  it('honours custom database names from the environment', async () => {
    process.env['MONGO_DB_BASE_DATABASE'] = 'custom-base';
    process.env['MONGO_DB_CONTRIBUTIONS_DATABASE'] = 'custom-contributions';
    process.env['MONGO_DB_USERS_DATABASE'] = 'custom-users';

    connectMock.mockResolvedValue({ connection: { host: 'db' } });
    useDbMock.mockImplementation((name: string) => ({ name }));

    const { default: createDatabaseConnection } = await loadConfig();

    await createDatabaseConnection('mongodb://db:27017');

    expect(connectMock).toHaveBeenCalledWith('mongodb://db:27017', {
      dbName: 'custom-base',
    });
    expect(useDbMock).toHaveBeenCalledWith('custom-contributions', {
      useCache: true,
    });
    expect(useDbMock).toHaveBeenCalledWith('custom-users', { useCache: true });
  });

  it('logs connection details in development mode', async () => {
    process.env['NODE_ENV'] = 'development';
    connectMock.mockResolvedValue({ connection: { host: 'localhost' } });
    useDbMock.mockImplementation((name: string) => ({ name }));
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    const { default: createDatabaseConnection } = await loadConfig();
    await createDatabaseConnection('mongodb://localhost:27017');

    expect(logSpy).toHaveBeenCalledTimes(3);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Successfully connected to the base database'),
    );

    logSpy.mockRestore();
  });
});

describe('database connection getters', () => {
  it('lazily creates each connection once and reuses it', async () => {
    useDbMock.mockImplementation((name: string) => ({ name }));

    const { getContributionsConnection, getUsersConnection } = await loadConfig();

    const contributions = getContributionsConnection();
    const users = getUsersConnection();

    expect(useDbMock).toHaveBeenCalledTimes(2);
    expect(getContributionsConnection()).toBe(contributions);
    expect(getUsersConnection()).toBe(users);
    expect(useDbMock).toHaveBeenCalledTimes(2);
  });

  it('falls back to default database names when env values are absent', async () => {
    delete process.env['MONGO_DB_CONTRIBUTIONS_DATABASE'];
    delete process.env['MONGO_DB_USERS_DATABASE'];
    useDbMock.mockImplementation((name: string) => ({ name }));

    const { getContributionsConnection, getUsersConnection } = await loadConfig();

    getContributionsConnection();
    getUsersConnection();

    expect(useDbMock).toHaveBeenCalledWith('contributions', { useCache: true });
    expect(useDbMock).toHaveBeenCalledWith('users', { useCache: true });
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '@/config/server';
import Dynasties from '@/models/Dynasties';
import Rulers from '@/models/Rulers';
import Wars from '@/models/Wars';

const entities = [
  { name: 'rulers', path: '/api/v1/rulers', key: 'ruler', plural: 'rulers' },
  { name: 'wars', path: '/api/v1/wars', key: 'war', plural: 'wars' },
  {
    name: 'dynasties',
    path: '/api/v1/dynasties',
    key: 'dynasty',
    plural: 'dynasties',
  },
] as const;

afterEach(() => {
  vi.restoreAllMocks();
});

// Each test file gets its own in-memory database, and the global setup clears
// every collection after each test, so these requests run against empty data.
describe.each(entities)('$name endpoints against an empty database', (entity) => {
  it('returns 404 from the random endpoint when no records exist', async () => {
    const response = await request(app).get(`${entity.path}/random`);

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      message: expect.stringContaining('Fail:'),
    });
  });

  it('returns an empty successful list from the collection endpoint', async () => {
    const response = await request(app).get(entity.path);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      size: 0,
      data: { [entity.plural]: [] },
    });
  });

  it('returns an empty title list when there are no records', async () => {
    const response = await request(app).get(`${entity.path}/search/titles`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      size: 0,
      data: { [entity.plural]: [] },
    });
  });

  it('returns an empty result for a search with no matches', async () => {
    const response = await request(app).get(
      `${entity.path}/s/nothing-matches-this-term`,
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('returns 404 for an unknown slug', async () => {
    const response = await request(app).get(
      `${entity.path}/this-slug-does-not-exist`,
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('returns 400 for a malformed object id', async () => {
    const response = await request(app).get(`${entity.path}/id/not-an-object-id`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('returns 404 for a well-formed but unknown object id', async () => {
    const response = await request(app).get(
      `${entity.path}/id/507f1f77bcf86cd799439011`,
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('returns 500 when the random aggregation fails', async () => {
    const model =
      entity.name === 'rulers'
        ? Rulers
        : entity.name === 'wars'
          ? Wars
          : Dynasties;

    vi.spyOn(model, 'aggregate').mockRejectedValueOnce(
      new Error('aggregation failed') as never,
    );

    const response = await request(app).get(`${entity.path}/random`);

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });
});

describe('Title projection variants', () => {
  it('returns slug fields when requested', async () => {
    const response = await request(app).get(
      '/api/v1/rulers/search/titles?include=slug',
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('returns the entity type when requested without id or slug', async () => {
    const response = await request(app).get(
      '/api/v1/wars/search/titles?include=type',
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe('Ruler list query handling', () => {
  it('accepts an explicit wars flag', async () => {
    const response = await request(app).get('/api/v1/rulers?wars=true');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('accepts a comma separated field selection', async () => {
    const response = await request(app).get(
      '/api/v1/rulers?fields=description,articles',
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('returns 500 when the list query fails', async () => {
    vi.spyOn(Rulers, 'find').mockImplementationOnce((() => {
      throw new Error('query failed');
    }) as never);

    const response = await request(app).get('/api/v1/rulers');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });
});

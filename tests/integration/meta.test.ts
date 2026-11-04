import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '@/config/server';
import packageJson from '@/package.json';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Base route', () => {
  it('returns the public API links', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      web: expect.stringContaining('itihaas'),
      docs: expect.stringContaining('docs'),
      github: expect.stringContaining('github.com'),
    });
  });
});

describe('Health check route', () => {
  it('reports database status and process metrics', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      db: { ok: 1 },
      uptime: expect.any(Number),
      memory: expect.any(Object),
      timestamp: expect.any(String),
    });
  });

  it('returns 500 when the database ping fails', async () => {
    vi.spyOn(mongoose.connection.db!, 'admin').mockReturnValue({
      ping: async () => {
        throw new Error('database unreachable');
      },
    } as never);

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({
      status: 'fail',
      error: 'database unreachable',
      timestamp: expect.any(String),
    });
  });
});

describe('Info and version routes', () => {
  it('returns API metadata from the info route', async () => {
    const response = await request(app).get('/api/info');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      app: 'itihaas-api',
      version: packageJson.version,
      node: process.version,
      platform: process.platform,
      pid: process.pid,
    });
  });

  it('returns the API version', async () => {
    const response = await request(app).get('/api/version');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      app: 'itihaas-api',
      version: packageJson.version,
      docs: 'https://itihaas.dev/docs',
      client: 'https://itihaas.dev/',
    });
  });
});

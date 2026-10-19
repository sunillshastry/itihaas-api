import app from '@/config/server';
import Dynasties from '@/models/Dynasties';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

describe('GET /api/v1/dynasties', function () {
  it('returns the dynasties successfully', async function () {
    await Dynasties.create({
      slug: 'test-dynasty',
      name: 'Test Dynasty',
    });

    const response = await request(app).get('/api/v1/dynasties');

    expect(response.status).toBe(200);

    expect(JSON.stringify(response.body)).toContain('Test Dynasty');
  });

  it('handles an empty collection', async function () {
    const response = await request(app).get('/api/v1/dynasties');

    expect(response.status).toBe(200);
  });
});

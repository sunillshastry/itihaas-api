import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { Types } from 'mongoose';

import app from '@/config/server';
import Dynasties from '@/models/Dynasties';

async function seedDynasty(overrides: Record<string, unknown> = {}) {
  return Dynasties.create({
    slug: 'maurya-test',
    name: 'Maurya Test Empire',
    otherNames: ['Mauryan Test Empire'],
    capitals: ['Pataliputra'],
    languages: ['Prakrit'],
    religions: ['Buddhism'],
    rulers: ['Ashoka'],
    wars: ['Kalinga War'],
    locations: ['Indian subcontinent'],
    currencies: ['Karshapana'],
    sources: ['Test source'],
    timeline: {
      begin: '-322',
      end: '-185',
    },
    area: {
      lowest: '1 million km²',
      highest: '5 million km²',
    },
    population: '50 million',
    description: {
      oneline: 'A test historical empire.',
      long: ['A longer test description.'],
    },
    ...overrides,
  });
}

describe('Dynasty routes', () => {
  describe('GET /api/v1/dynasties', () => {
    it('returns a successful response containing the seeded dynasty', async () => {
      await seedDynasty();

      const response = await request(app).get('/api/v1/dynasties');

      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).toContain('maurya-test');
      expect(JSON.stringify(response.body)).toContain('Maurya Test Empire');
    });

    it('returns a successful response when no dynasties exist', async () => {
      const response = await request(app).get('/api/v1/dynasties');

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
    });

    it('returns more than one seeded dynasty', async () => {
      await seedDynasty({
        slug: 'dynasty-alpha',
        name: 'Dynasty Alpha',
      });

      await seedDynasty({
        slug: 'dynasty-beta',
        name: 'Dynasty Beta',
      });

      const response = await request(app).get('/api/v1/dynasties');

      expect(response.status).toBe(200);

      const body = JSON.stringify(response.body);
      expect(body).toContain('dynasty-alpha');
      expect(body).toContain('dynasty-beta');
    });

    it('supports selecting optional fields', async () => {
      await seedDynasty();

      const response = await request(app)
        .get('/api/v1/dynasties')
        .query({ fields: 'area,languages,religions,currencies' });

      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).toContain('maurya-test');
    });

    it('supports requesting description fields', async () => {
      await seedDynasty();

      const response = await request(app)
        .get('/api/v1/dynasties')
        .query({ fields: 'description' });

      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).toContain(
        'A longer test description.',
      );
    });

    it('supports requesting wars and rulers', async () => {
      await seedDynasty();

      const response = await request(app).get('/api/v1/dynasties').query({
        wars: 'true',
        rulers: 'true',
      });

      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).toContain('maurya-test');
    });

    it('returns 400 on an unsupported fields parameter', async () => {
      await seedDynasty();

      const response = await request(app)
        .get('/api/v1/dynasties')
        .query({ fields: 'fieldThatDoesNotExist' });

      expect(response.status).toBe(400);
    });

    it('returns 400 on comma-separated fields with mixed casing', async () => {
      await seedDynasty();

      const response = await request(app)
        .get('/api/v1/dynasties')
        .query({ fields: 'languages,RELIGIONS' });

      expect(response.status).toBe(400);
    });

    it('returns 400 on an empty fields parameter', async () => {
      const response = await request(app)
        .get('/api/v1/dynasties')
        .query({ fields: '' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/dynasties/search/titles', () => {
    it('returns dynasty titles successfully', async () => {
      await seedDynasty();

      const response = await request(app).get(
        '/api/v1/dynasties/search/titles',
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.size).toBe(1);
      expect(response.body.data.dynasties).toContain('Maurya Test Empire');
    });

    it('returns an empty title list when no dynasties exist', async () => {
      const response = await request(app).get(
        '/api/v1/dynasties/search/titles',
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.size).toBe(0);
      expect(response.body.data.dynasties).toEqual([]);
    });
  });

  describe('GET /api/v1/dynasties/random', () => {
    it('returns a dynasty when one exists', async () => {
      await seedDynasty();

      const response = await request(app).get('/api/v1/dynasties/random');

      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).toContain('maurya-test');
    });

    it('returns a valid seeded result when multiple dynasties exist', async () => {
      await seedDynasty({
        slug: 'random-alpha',
        name: 'Random Alpha',
      });

      await seedDynasty({
        slug: 'random-beta',
        name: 'Random Beta',
      });

      const response = await request(app).get('/api/v1/dynasties/random');

      expect(response.status).toBe(200);

      const body = JSON.stringify(response.body);
      expect(
        body.includes('random-alpha') || body.includes('random-beta'),
      ).toBe(true);
    });
  });

  describe('GET /api/v1/dynasties/s/:search', () => {
    it('finds a dynasty matching its slug or searchable text', async () => {
      await seedDynasty();

      const response = await request(app).get('/api/v1/dynasties/s/maurya');

      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).toContain('maurya-test');
    });

    it('handles a search with no matches', async () => {
      await seedDynasty();

      const response = await request(app).get(
        '/api/v1/dynasties/s/no-such-dynasty-xyz',
      );

      expect([200, 404]).toContain(response.status);
    });

    it('handles URL-encoded search input', async () => {
      await seedDynasty();

      const response = await request(app).get(
        '/api/v1/dynasties/s/Maurya%20Test',
      );

      expect([200, 400, 404]).toContain(response.status);
    });

    it('does not return a server error for injection-like input', async () => {
      const response = await request(app).get('/api/v1/dynasties/s/%24%7B%7D');

      expect(response.status).toBeLessThan(500);
    });
  });

  describe('GET /api/v1/dynasties/id/:id', () => {
    it('returns a dynasty by its MongoDB ID', async () => {
      const dynasty = await seedDynasty();

      const response = await request(app).get(
        `/api/v1/dynasties/id/${dynasty._id.toString()}`,
      );

      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).toContain('maurya-test');
    });

    it('returns 404 for a valid but nonexistent MongoDB ID', async () => {
      const nonexistentId = new Types.ObjectId().toString();

      const response = await request(app).get(
        `/api/v1/dynasties/id/${nonexistentId}`,
      );

      expect(response.status).toBe(404);
    });

    it('returns 400 for a malformed MongoDB ID', async () => {
      const response = await request(app).get(
        '/api/v1/dynasties/id/not-an-object-id',
      );

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid dynasty ID');
    });
  });

  describe('GET /api/v1/dynasties/:slug', () => {
    it('returns a dynasty by slug', async () => {
      await seedDynasty();

      const response = await request(app).get('/api/v1/dynasties/maurya-test');

      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).toContain('Maurya Test Empire');
    });

    it('returns 404 for a nonexistent slug', async () => {
      const response = await request(app).get(
        '/api/v1/dynasties/nonexistent-dynasty-xyz',
      );

      expect(response.status).toBe(404);
    });

    it('does not intercept the reserved random endpoint as a slug', async () => {
      await seedDynasty();

      const response = await request(app).get('/api/v1/dynasties/random');

      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).toContain('maurya-test');
    });
  });
});

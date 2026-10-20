import { describe, expect, it } from 'vitest';
import request from 'supertest';

import app from '@/config/server';
import Dynasties from '@/models/Dynasties';

describe('Dynasty API end-to-end', () => {
  it('supports listing a dynasty and retrieving it by slug and ID', async () => {
    const created = await Dynasties.create({
      slug: 'e2e-dynasty',
      name: 'E2E Test Dynasty',
      otherNames: ['End-to-End Dynasty'],
      capitals: ['Test Capital'],
      timeline: {
        begin: '100 BCE',
        end: '100 CE',
      },
    });

    // Step 1: Find the dynasty through the list endpoint.
    const listResponse = await request(app).get('/api/v1/dynasties');

    expect(listResponse.status).toBe(200);
    expect(JSON.stringify(listResponse.body)).toContain('e2e-dynasty');

    // Step 2: Retrieve the same dynasty by slug.
    const slugResponse = await request(app).get(
      '/api/v1/dynasties/e2e-dynasty',
    );

    expect(slugResponse.status).toBe(200);
    expect(JSON.stringify(slugResponse.body)).toContain('E2E Test Dynasty');

    // Step 3: Retrieve the same record by its database ID.
    const idResponse = await request(app).get(
      `/api/v1/dynasties/id/${created._id.toString()}`,
    );

    expect(idResponse.status).toBe(200);
    expect(JSON.stringify(idResponse.body)).toContain('e2e-dynasty');
  });

  it('returns consistent identity data across endpoints', async () => {
    const created = await Dynasties.create({
      slug: 'identity-check',
      name: 'Identity Check Dynasty',
    });

    const bySlug = await request(app).get('/api/v1/dynasties/identity-check');

    const byId = await request(app).get(
      `/api/v1/dynasties/id/${created._id.toString()}`,
    );

    expect(bySlug.status).toBe(200);
    expect(byId.status).toBe(200);

    // Adapt these paths if the controllers wrap documents in a
    // response envelope such as { data: ... }.
    expect(JSON.stringify(bySlug.body)).toContain('identity-check');
    expect(JSON.stringify(byId.body)).toContain('identity-check');
    expect(JSON.stringify(bySlug.body)).toContain('Identity Check Dynasty');
    expect(JSON.stringify(byId.body)).toContain('Identity Check Dynasty');
  });
});

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '@/config/server';
import Rulers from '@/models/Rulers';

describe('Ruler API end-to-end', () => {
  const slug = 'e2e-ruler-suite';

  beforeEach(async () => {
    await Rulers.deleteMany({ slug });
    await Rulers.create({
      slug,
      name: 'E2E Test Ruler',
      otherNames: ['End-to-End Ruler'],
      born: '100 BCE',
      died: '50 BCE',
      dynasty: 'E2E Dynasty',
      religion: 'Example tradition',
      predecessor: 'Previous Ruler',
      successor: 'Next Ruler',
      family: {
        father: 'E2E Father',
        mother: 'E2E Mother',
        wives: ['E2E Wife'],
        children: ['E2E Child'],
      },
      wars: ['e2e-war'],
      timeline: { begin: '80 BCE', end: '50 BCE' },
      description: {
        oneline: 'A ruler created for E2E testing',
        long: ['Detailed E2E description'],
      },
      sources: ['E2E source'],
      furtherReading: [
        { publisher: 'E2E Press', link: 'https://example.com/e2e-reading' },
      ],
      articles: [
        {
          title: 'E2E article',
          authors: ['E2E Author'],
          publisher: 'E2E Journal',
          link: 'https://example.com/e2e-article',
        },
      ],
    });
  });

  afterEach(async () => {
    await Rulers.deleteMany({ slug });
  });

  it('supports listing and retrieving a ruler by slug and ID', async () => {
    const created = await Rulers.findOne({ slug });
    expect(created).not.toBeNull();

    const list = await request(app).get('/api/v1/rulers');
    expect(list.status).toBe(200);
    expect(
      list.body.data.rulers.some((r: { slug: string }) => r.slug === slug),
    ).toBe(true);

    const bySlug = await request(app).get(`/api/v1/rulers/${slug}`);
    expect(bySlug.status).toBe(200);
    expect(bySlug.body.data.ruler.name).toBe('E2E Test Ruler');

    const byId = await request(app).get(
      `/api/v1/rulers/id/${created!?._id.toString()}`,
    );
    expect(byId.status).toBe(200);
    expect(byId.body.data.ruler.slug).toBe(slug);
  });

  it('returns consistent identity across slug, ID, search, and title endpoints', async () => {
    const created = await Rulers.findOne({ slug });
    const [bySlug, byId, search, titles] = await Promise.all([
      request(app).get(`/api/v1/rulers/${slug}`),
      request(app).get(`/api/v1/rulers/id/${created!?._id.toString()}`),
      request(app).get('/api/v1/rulers/s/E2E%20Test%20Ruler'),
      request(app).get('/api/v1/rulers/search/titles?include=id,slug,type'),
    ]);

    expect(bySlug.status).toBe(200);
    expect(byId.status).toBe(200);
    expect(search.status).toBe(200);
    expect(titles.status).toBe(200);
    expect(bySlug.body.data.ruler.slug).toBe(slug);
    expect(byId.body.data.ruler.slug).toBe(slug);
    expect(
      search.body.data.rulers.some((r: { slug: string }) => r.slug === slug),
    ).toBe(true);
    expect(
      titles.body.data.rulers.find((r: { slug: string }) => r.slug === slug),
    ).toMatchObject({ slug, type: 'ruler' });
  });
});

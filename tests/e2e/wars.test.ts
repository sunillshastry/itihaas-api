import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '@/config/server';
import Wars from '@/models/Wars';

describe('War API end-to-end', () => {
  const slug = 'e2e-war-suite';

  beforeEach(async () => {
    await Wars.deleteMany({ slug });
    await Wars.create({
      slug,
      name: 'E2E Test War',
      otherNames: ['End-to-End Conflict'],
      type: 'war',
      timeline: { begin: '100 BCE', end: '90 BCE' },
      locations: ['E2E Valley'],
      belligerents: [
        { name: 'E2E Kingdom A', type: 'kingdom', leaders: ['E2E Ruler A'] },
        {
          name: 'E2E Coalition B',
          type: 'coalition',
          leaders: ['E2E Ruler B'],
        },
      ],
      outcome: {
        result: 'victory',
        winners: ['E2E Kingdom A'],
        losers: ['E2E Coalition B'],
      },
      casualties: { sideA: 100, sideB: 200, notes: 'E2E estimates' },
      causes: ['E2E cause'],
      relatedDynasties: ['e2e-dynasty'],
      relatedRulers: ['e2e-ruler'],
      relatedWars: ['earlier-e2e-war'],
      description: {
        oneline: 'A war created for E2E testing',
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
    await Wars.deleteMany({ slug });
  });

  it('supports listing and retrieving a war by slug and ID', async () => {
    const created = await Wars.findOne({ slug });
    expect(created).not.toBeNull();

    const list = await request(app).get('/api/v1/wars');
    expect(list.status).toBe(200);
    expect(
      list.body.data.wars.some((w: { slug: string }) => w.slug === slug),
    ).toBe(true);

    const bySlug = await request(app).get(`/api/v1/wars/${slug}`);
    expect(bySlug.status).toBe(200);
    expect(bySlug.body.data.war.name).toBe('E2E Test War');

    const byId = await request(app).get(
      `/api/v1/wars/id/${created!._id.toString()}`,
    );
    expect(byId.status).toBe(200);
    expect(byId.body.data.war.slug).toBe(slug);
  });

  it('returns consistent identity across slug, ID, search, and title endpoints', async () => {
    const created = await Wars.findOne({ slug });
    const [bySlug, byId, search, titles] = await Promise.all([
      request(app).get(`/api/v1/wars/${slug}`),
      request(app).get(`/api/v1/wars/id/${created!._id.toString()}`),
      request(app).get('/api/v1/wars/s/E2E%20Test%20War'),
      request(app).get('/api/v1/wars/search/titles?include=id,slug,type'),
    ]);

    expect(bySlug.status).toBe(200);
    expect(byId.status).toBe(200);
    expect(search.status).toBe(200);
    expect(titles.status).toBe(200);
    expect(bySlug.body.data.war.slug).toBe(slug);
    expect(byId.body.data.war.slug).toBe(slug);
    expect(
      search.body.data.wars.some((w: { slug: string }) => w.slug === slug),
    ).toBe(true);
    expect(
      titles.body.data.wars.find((w: { slug: string }) => w.slug === slug),
    ).toMatchObject({ slug, type: 'war' });
  });

  it('preserves nested belligerent, outcome, and casualty data through the API', async () => {
    const response = await request(app).get(`/api/v1/wars/${slug}`);
    expect(response.status).toBe(200);
    expect(response.body.data.war.belligerents[0]).toMatchObject({
      name: 'E2E Kingdom A',
      type: 'kingdom',
      leaders: ['E2E Ruler A'],
    });
    expect(response.body.data.war.outcome).toMatchObject({
      result: 'victory',
      winners: ['E2E Kingdom A'],
      losers: ['E2E Coalition B'],
    });
    expect(response.body.data.war.casualties).toMatchObject({
      sideA: 100,
      sideB: 200,
      notes: 'E2E estimates',
    });
  });
});

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '@/config/server';
import Wars from '@/models/Wars';

const prefix = '/api/v1/wars';
const slugs = ['integration-war-one', 'integration-war-two'];

beforeEach(async () => {
  await Wars.deleteMany({ slug: { $in: slugs } });
  await Wars.create([
    {
      slug: slugs[0],
      name: 'Integration War One',
      otherNames: ['First Conflict'],
      type: 'battle',
      timeline: { begin: '100 BCE', end: '99 BCE' },
      locations: ['Integration Valley'],
      belligerents: [
        { name: 'Kingdom A', type: 'kingdom', leaders: ['Ruler A'] },
        { name: 'Coalition B', type: 'coalition', leaders: ['Ruler B'] },
      ],
      outcome: {
        result: 'victory',
        winners: ['Kingdom A'],
        losers: ['Coalition B'],
      },
      casualties: { sideA: 10, sideB: 20, notes: 'Test estimates' },
      causes: ['Territory'],
      relatedDynasties: ['dynasty-a'],
      relatedRulers: ['ruler-a'],
      relatedWars: ['earlier-war'],
      description: { oneline: 'First fixture', long: ['Long war description'] },
      sources: ['Test source'],
      furtherReading: [
        { publisher: 'Test Press', link: 'https://example.com/read' },
      ],
      articles: [{ title: 'Test article', authors: ['Test Author'] }],
    },
    {
      slug: slugs[1],
      name: 'Integration War Two',
      otherNames: ['Second Conflict'],
      type: 'siege',
      locations: ['Second Valley'],
      description: { oneline: 'Second fixture' },
    },
  ]);
});

afterEach(async () => {
  await Wars.deleteMany({ slug: { $in: slugs } });
});

describe('Wars API integration', () => {
  it('lists wars with the expected response envelope', async () => {
    const response = await request(app).get(prefix);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      size: expect.any(Number),
      data: { wars: expect.any(Array) },
    });
    expect(
      response.body.data.wars.some(
        (w: { slug: string }) => w.slug === slugs[0],
      ),
    ).toBe(true);
  });

  it('retrieves a war by slug with nested belligerents and outcome', async () => {
    const response = await request(app).get(`${prefix}/${slugs[0]}`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        war: {
          slug: slugs[0],
          name: 'Integration War One',
          belligerents: [
            { name: 'Kingdom A', type: 'kingdom' },
            { name: 'Coalition B', type: 'coalition' },
          ],
          outcome: {
            result: 'victory',
            winners: ['Kingdom A'],
            losers: ['Coalition B'],
          },
        },
      },
    });
  });

  it('retrieves a war by MongoDB ID', async () => {
    const created = await Wars.findOne({ slug: slugs[0] });
    expect(created).not.toBeNull();
    const response = await request(app).get(
      `${prefix}/id/${created!._id.toString()}`,
    );
    expect(response.status).toBe(200);
    expect(response.body.data.war.slug).toBe(slugs[0]);
  });

  it('returns 404 for an unknown slug', async () => {
    const response = await request(app).get(
      `${prefix}/this-war-does-not-exist`,
    );
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('searches by name, alternate name, and location', async () => {
    for (const term of [
      'Integration War One',
      'First Conflict',
      'Integration Valley',
    ]) {
      const response = await request(app).get(
        `${prefix}/s/${encodeURIComponent(term)}`,
      );
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        entity: 'war',
        data: { wars: expect.any(Array) },
      });
      expect(
        response.body.data.wars.some(
          (w: { slug: string }) => w.slug === slugs[0],
        ),
      ).toBe(true);
    }
  });

  it('returns an empty successful result when search has no matches', async () => {
    const response = await request(app).get(
      `${prefix}/s/no-such-war-987654321`,
    );
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      size: 0,
      entity: 'war',
      data: { wars: [] },
    });
  });

  it('includes requested optional search fields', async () => {
    const response = await request(app).get(
      `${prefix}/s/Integration%20War%20One?fields=description,causes,relatedDynasties,relatedRulers,relatedWars,sources,readings,articles`,
    );
    expect(response.status).toBe(200);
    const war = response.body.data.wars.find(
      (w: { slug: string }) => w.slug === slugs[0],
    );
    expect(war.description.long).toEqual(['Long war description']);
    expect(war.causes).toEqual(['Territory']);
    expect(war.sources).toEqual(['Test source']);
    expect(war.furtherReading[0].publisher).toBe('Test Press');
    expect(war.articles[0].title).toBe('Test article');
    expect(war.relatedDynasties).toBeUndefined();
    expect(war.relatedRulers).toBeUndefined();
    expect(war.relatedWars).toBeUndefined();
  });

  it('returns war names by default from the titles endpoint', async () => {
    const response = await request(app).get(`${prefix}/search/titles`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.wars).toContain('Integration War One');
  });

  it('supports title include fields id, slug, and type', async () => {
    const response = await request(app).get(
      `${prefix}/search/titles?include=id,slug,type`,
    );
    expect(response.status).toBe(200);
    const war = response.body.data.wars.find(
      (w: { slug: string }) => w.slug === slugs[0],
    );
    expect(war).toMatchObject({
      _id: expect.any(String),
      slug: slugs[0],
      type: 'war',
      name: 'Integration War One',
    });
  });

  it('returns 404 for unsupported title include fields', async () => {
    const response = await request(app).get(
      `${prefix}/search/titles?include=notAField`,
    );
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('returns a random war when records exist', async () => {
    const response = await request(app).get(`${prefix}/random`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.war).toBeDefined();
  });
});

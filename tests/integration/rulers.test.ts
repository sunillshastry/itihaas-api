import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '@/config/server';
import Rulers from '@/models/Rulers';

const prefix = '/api/v1/rulers';
const slugs = ['integration-ruler-one', 'integration-ruler-two'];

beforeEach(async () => {
  await Rulers.deleteMany({ slug: { $in: slugs } });

  await Rulers.create([
    {
      slug: slugs[0],
      name: 'Integration Ruler One',
      otherNames: ['The First Example'],
      dynasty: 'Integration Dynasty',
      born: '100 BCE',
      timeline: { begin: '80 BCE', end: '50 BCE' },
      family: { father: 'Test Father', wives: ['Test Wife'] },
      description: {
        oneline: 'First fixture',
        long: ['Long first description'],
      },
      sources: ['Test source'],
      furtherReading: [
        {
          publisher: 'Test Press',
          link: 'https://example.com/read',
        },
      ],
      articles: [
        {
          title: 'Test article',
          authors: ['Test Author'],
        },
      ],
    },
    {
      slug: slugs[1],
      name: 'Integration Ruler Two',
      otherNames: ['The Second Example'],
      dynasty: 'Other Dynasty',
      description: { oneline: 'Second fixture' },
    },
  ]);
});

afterEach(async () => {
  await Rulers.deleteMany({ slug: { $in: slugs } });
});

describe('Rulers API integration', () => {
  it('lists rulers with the expected envelope and default fields', async () => {
    const response = await request(app).get(prefix);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      size: expect.any(Number),
      data: { rulers: expect.any(Array) },
    });
    expect(
      response.body.data.rulers.some(
        (r: { slug: string }) => r.slug === slugs[0],
      ),
    ).toBe(true);
  });

  it('retrieves a ruler by slug and includes nested data', async () => {
    const response = await request(app).get(`${prefix}/${slugs[0]}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        ruler: {
          slug: slugs[0],
          name: 'Integration Ruler One',
          family: {
            father: 'Test Father',
            wives: ['Test Wife'],
          },
        },
      },
    });
  });

  it('retrieves a ruler by MongoDB ID', async () => {
    const created = await Rulers.findOne({ slug: slugs[0] });

    expect(created).not.toBeNull();

    const response = await request(app).get(
      `${prefix}/id/${created!._id.toString()}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data.ruler.slug).toBe(slugs[0]);
  });

  it('returns 404 for an unknown slug', async () => {
    const response = await request(app).get(
      `${prefix}/this-ruler-does-not-exist`,
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('searches by name, other name, and dynasty', async () => {
    for (const term of [
      'Integration Ruler One',
      'First Example',
      'Integration Dynasty',
    ]) {
      const response = await request(app).get(
        `${prefix}/s/${encodeURIComponent(term)}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        entity: 'ruler',
        data: { rulers: expect.any(Array) },
      });
      expect(
        response.body.data.rulers.some(
          (r: { slug: string }) => r.slug === slugs[0],
        ),
      ).toBe(true);
    }
  });

  it('returns an empty successful result for a search with no matches', async () => {
    const response = await request(app).get(
      `${prefix}/s/no-such-ruler-987654321`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      size: 0,
      entity: 'ruler',
      data: { rulers: [] },
    });
  });

  it('includes optional search fields when requested', async () => {
    const response = await request(app).get(
      `${prefix}/s/Integration%20Ruler%20One?fields=description,articles,readings,sources`,
    );

    expect(response.status).toBe(200);

    const ruler = response.body.data.rulers.find(
      (r: { slug: string }) => r.slug === slugs[0],
    );

    expect(ruler.description.long).toEqual(['Long first description']);
    expect(ruler.articles[0].title).toBe('Test article');
    expect(ruler.furtherReading[0].publisher).toBe('Test Press');
    expect(ruler.sources).toEqual(['Test source']);
  });

  it('returns ruler names by default from the titles endpoint', async () => {
    const response = await request(app).get(`${prefix}/search/titles`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.rulers).toContain('Integration Ruler One');
  });

  it('supports title include fields id, slug, and type', async () => {
    const response = await request(app).get(
      `${prefix}/search/titles?include=id,slug,type`,
    );

    expect(response.status).toBe(200);

    const ruler = response.body.data.rulers.find(
      (r: { slug: string }) => r.slug === slugs[0],
    );

    expect(ruler).toMatchObject({
      _id: expect.any(String),
      slug: slugs[0],
      type: 'ruler',
      name: 'Integration Ruler One',
    });
  });

  it('returns 404 for an unsupported title include field', async () => {
    const response = await request(app).get(
      `${prefix}/search/titles?include=notAField`,
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('returns a random ruler when records exist', async () => {
    const response = await request(app).get(`${prefix}/random`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.ruler).toBeDefined();
  });
});

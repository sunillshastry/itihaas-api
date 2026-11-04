import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '@/config/server';
import ApiDocsQuery from '@/models/contributions/api/ApiDocsQuery';
import EditEntity from '@/models/contributions/edit/EditEntity';
import GeneralContribution from '@/models/contributions/general/GeneralContribution';
import NewDynasty from '@/models/contributions/new/NewDynasty';
import NewEntity from '@/models/contributions/new/NewEntity';
import NewRuler from '@/models/contributions/new/NewRuler';
import NewWar from '@/models/contributions/new/NewWar';

const prefix = '/api/v1/contributions';

const contributor = {
  userName: 'Contributor',
  userEmail: 'contributor@example.com',
  userLocation: 'Bengaluru',
  enablePublicCredentials: true,
};

const validPayloads = {
  entity: {
    path: `${prefix}/new/entity`,
    body: {
      name: 'Contribution Entity',
      description: 'An entity',
      ...contributor,
    },
  },
  dynasty: {
    path: `${prefix}/new/dynasty`,
    body: {
      name: 'Contribution Dynasty',
      timelineBegin: '300 BCE',
      timelineEnd: '200 BCE',
      descriptionShort: 'A short description',
      sources: 'A source',
      ...contributor,
    },
  },
  ruler: {
    path: `${prefix}/new/ruler`,
    body: {
      name: 'Contribution Ruler',
      dynasty: 'Contribution Dynasty',
      descriptionShort: 'A ruler description',
      sources: 'A source',
      ...contributor,
    },
  },
  war: {
    path: `${prefix}/new/war`,
    body: {
      name: 'Contribution War',
      descriptionShort: 'A war description',
      sources: 'A source',
      ...contributor,
    },
  },
  edit: {
    path: `${prefix}/edit`,
    body: {
      entity: 'ruler',
      name: 'Contribution Ruler',
      link: 'https://itihaas.dev/api/v1/rulers/contribution-ruler',
      fieldName: 'born',
      fieldContent: '100 BCE',
      sources: 'A source',
      ...contributor,
    },
  },
  apiDocs: {
    path: `${prefix}/api`,
    body: {
      type: 'docs',
      subject: 'Docs clarification',
      description: 'The docs need an example',
      ...contributor,
    },
  },
  general: {
    path: `${prefix}/general`,
    body: {
      subject: 'General question',
      description: 'A general contribution description',
      ...contributor,
    },
  },
} as const;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Contributions API integration', () => {
  describe.each(Object.entries(validPayloads))(
    'POST %s contribution',
    (name, payload) => {
      it('returns 400 when the body is missing required fields', async () => {
        const response = await request(app).post(payload.path).send({});

        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({
          success: false,
          message: 'Error: Request validation failed or missing attributes',
        });
        expect(response.body.errors.length).toBeGreaterThan(0);
      });

      it('returns 400 when the contributor email is invalid', async () => {
        const response = await request(app)
          .post(payload.path)
          .send({ ...payload.body, userEmail: 'not-an-email' });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('accepts a valid submission with status 201', async () => {
        const response = await request(app)
          .post(payload.path)
          .send(payload.body);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
      });

      it('returns 500 when persistence fails', async () => {
        const model = modelFor(name);
        vi.spyOn(model, 'create').mockRejectedValueOnce(
          new Error('database down') as never,
        );

        const response = await request(app)
          .post(payload.path)
          .send(payload.body);

        expect(response.status).toBe(500);
        expect(response.body.success).toBe(false);
      });
    },
  );

  it('persists a new entity contribution with trimmed fields', async () => {
    const response = await request(app)
      .post(validPayloads.entity.path)
      .send({ ...validPayloads.entity.body, name: '  Persisted Entity  ' });

    expect(response.status).toBe(201);

    const stored = await NewEntity.findOne({ name: 'Persisted Entity' });
    expect(stored).not.toBeNull();
    expect(stored?.userEmail).toBe('contributor@example.com');
    expect(stored?.enablePublicCredentials).toBe(true);
  });

  it('maps dynasty timeline fields into the stored timeline object', async () => {
    const response = await request(app)
      .post(validPayloads.dynasty.path)
      .send(validPayloads.dynasty.body);

    expect(response.status).toBe(201);

    const stored = await NewDynasty.findOne({ name: 'Contribution Dynasty' });
    expect(stored?.timeline).toMatchObject({
      begin: '300 BCE',
      end: '200 BCE',
    });
  });

  it('persists ruler, war, edit, api-docs, and general contributions', async () => {
    await request(app)
      .post(validPayloads.ruler.path)
      .send(validPayloads.ruler.body);
    await request(app)
      .post(validPayloads.war.path)
      .send(validPayloads.war.body);
    await request(app)
      .post(validPayloads.edit.path)
      .send(validPayloads.edit.body);
    await request(app)
      .post(validPayloads.apiDocs.path)
      .send(validPayloads.apiDocs.body);
    await request(app)
      .post(validPayloads.general.path)
      .send(validPayloads.general.body);

    expect(
      await NewRuler.findOne({ name: 'Contribution Ruler' }),
    ).not.toBeNull();
    expect(await NewWar.findOne({ name: 'Contribution War' })).not.toBeNull();
    expect(await EditEntity.findOne({ fieldName: 'born' })).not.toBeNull();
    expect(
      await ApiDocsQuery.findOne({ subject: 'Docs clarification' }),
    ).not.toBeNull();
    expect(
      await GeneralContribution.findOne({ subject: 'General question' }),
    ).not.toBeNull();
  });

  it('rejects an unsupported edit entity type', async () => {
    const response = await request(app)
      .post(validPayloads.edit.path)
      .send({ ...validPayloads.edit.body, entity: 'empire' });

    expect(response.status).toBe(400);
  });

  it('rejects an unsupported api/docs type', async () => {
    const response = await request(app)
      .post(validPayloads.apiDocs.path)
      .send({ ...validPayloads.apiDocs.body, type: 'blog' });

    expect(response.status).toBe(400);
  });
});

function modelFor(name: string) {
  switch (name) {
    case 'entity':
      return NewEntity;
    case 'dynasty':
      return NewDynasty;
    case 'ruler':
      return NewRuler;
    case 'war':
      return NewWar;
    case 'edit':
      return EditEntity;
    case 'apiDocs':
      return ApiDocsQuery;
    case 'general':
      return GeneralContribution;
    default:
      throw new Error(`Unknown contribution type: ${name}`);
  }
}

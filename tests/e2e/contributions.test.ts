import { describe, expect, it } from 'vitest';
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
  userName: 'E2E Contributor',
  userEmail: 'e2e-contributor@example.com',
};

describe('Contributions API end-to-end', () => {
  it('accepts and stores one contribution of every type', async () => {
    const payloads = [
      {
        path: `${prefix}/new/entity`,
        body: {
          name: 'E2E Entity',
          description: 'E2E entity description',
          ...contributor,
        },
      },
      {
        path: `${prefix}/new/dynasty`,
        body: {
          name: 'E2E Dynasty',
          timelineBegin: '1200 CE',
          timelineEnd: '1300 CE',
          descriptionShort: 'E2E dynasty short description',
          sources: 'E2E source',
          ...contributor,
        },
      },
      {
        path: `${prefix}/new/ruler`,
        body: {
          name: 'E2E Ruler',
          dynasty: 'E2E Dynasty',
          descriptionShort: 'E2E ruler description',
          sources: 'E2E source',
          ...contributor,
        },
      },
      {
        path: `${prefix}/new/war`,
        body: {
          name: 'E2E War',
          descriptionShort: 'E2E war description',
          sources: 'E2E source',
          ...contributor,
        },
      },
      {
        path: `${prefix}/edit`,
        body: {
          entity: 'dynasty',
          name: 'E2E Dynasty',
          link: 'https://itihaas.dev/api/v1/dynasties/e2e-dynasty',
          fieldName: 'capital',
          fieldContent: 'E2E Capital',
          sources: 'E2E source',
          ...contributor,
        },
      },
      {
        path: `${prefix}/api`,
        body: {
          type: 'api',
          subject: 'E2E API question',
          description: 'An API question raised end-to-end',
          ...contributor,
        },
      },
      {
        path: `${prefix}/general`,
        body: {
          subject: 'E2E general feedback',
          description: 'Feedback submitted end-to-end',
          ...contributor,
        },
      },
    ];

    for (const payload of payloads) {
      const response = await request(app).post(payload.path).send(payload.body);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    }

    // Confirm every record actually landed in the contributions database
    expect(await NewEntity.findOne({ name: 'E2E Entity' })).not.toBeNull();
    expect(await NewDynasty.findOne({ name: 'E2E Dynasty' })).not.toBeNull();
    expect(await NewRuler.findOne({ name: 'E2E Ruler' })).not.toBeNull();
    expect(await NewWar.findOne({ name: 'E2E War' })).not.toBeNull();
    expect(await EditEntity.findOne({ name: 'E2E Dynasty' })).not.toBeNull();
    expect(
      await ApiDocsQuery.findOne({ subject: 'E2E API question' }),
    ).not.toBeNull();
    expect(
      await GeneralContribution.findOne({ subject: 'E2E general feedback' }),
    ).not.toBeNull();
  });

  it('records timestamps for accepted contributions', async () => {
    const response = await request(app)
      .post(`${prefix}/general`)
      .send({
        subject: 'Timestamp check',
        description: 'Checking createdAt and updatedAt',
        ...contributor,
      });

    expect(response.status).toBe(201);

    const stored = await GeneralContribution.findOne({
      subject: 'Timestamp check',
    });

    expect(stored?.createdAt).toBeInstanceOf(Date);
    expect(stored?.updatedAt).toBeInstanceOf(Date);
  });

  it('rejects a contribution with a too-long description', async () => {
    const response = await request(app)
      .post(`${prefix}/general`)
      .send({
        subject: 'Too long',
        description: 'x'.repeat(2501),
        ...contributor,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

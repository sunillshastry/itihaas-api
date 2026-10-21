import { describe, expect, it } from 'vitest';
import Wars from '@/models/Wars';

describe('War model', () => {
  it('requires slug and name', () => {
    const errors = new Wars({}).validateSync()?.errors;
    expect(errors?.['slug']).toBeDefined();
    expect(errors?.['name']).toBeDefined();
  });

  it('accepts a valid war with nested belligerents and outcome', () => {
    const war = new Wars({
      slug: 'unit-test-war',
      name: 'Unit Test War',
      type: 'war',
      timeline: { begin: '100 BCE', end: '90 BCE' },
      locations: ['Example Valley'],
      belligerents: [
        { name: 'Kingdom A', type: 'kingdom', leaders: ['Ruler A'] },
        { name: 'Coalition B', type: 'coalition', leaders: ['Ruler B'] },
      ],
      outcome: {
        result: 'victory',
        winners: ['Kingdom A'],
        losers: ['Coalition B'],
      },
      casualties: { sideA: 100, sideB: 200, notes: 'Estimated figures' },
      causes: ['Territorial dispute'],
      relatedDynasties: ['dynasty-a'],
      relatedRulers: ['ruler-a'],
      relatedWars: ['earlier-war'],
      description: { oneline: 'A test war', long: ['Details'] },
      sources: ['Source 1'],
      furtherReading: [
        { publisher: 'Example Press', link: 'https://example.com/reading' },
      ],
      articles: [
        {
          title: 'Article',
          authors: ['A. Author'],
          publisher: 'Journal',
          link: 'https://example.com/article',
        },
      ],
    });
    expect(war.validateSync()).toBeUndefined();
  });

  it.each(['battle', 'war', 'campaign', 'siege'])(
    'accepts type "%s"',
    (type) => {
      const war = new Wars({ slug: `type-${type}`, name: 'Type Test', type });
      expect(war.validateSync()).toBeUndefined();
    },
  );

  it('rejects an unsupported war type', () => {
    const war = new Wars({
      slug: 'invalid-type-war',
      name: 'Invalid Type',
      type: 'skirmish',
    });
    expect(war.validateSync()?.errors?.['type']).toBeDefined();
  });

  it.each(['victory', 'defeat', 'stalemate', 'indecisive'])(
    'accepts outcome result "%s"',
    (result) => {
      const war = new Wars({
        slug: `result-${result}`,
        name: 'Result Test',
        outcome: { result },
      });
      expect(war.validateSync()).toBeUndefined();
    },
  );

  it('rejects an unsupported outcome result', () => {
    const war = new Wars({
      slug: 'invalid-result-war',
      name: 'Invalid Result',
      outcome: { result: 'draw' },
    });
    expect(war.validateSync()?.errors['outcome.result']).toBeDefined();
  });

  it.each(['dynasty', 'kingdom', 'rebellion', 'coalition'])(
    'accepts belligerent type "%s"',
    (type) => {
      const war = new Wars({
        slug: `belligerent-${type}`,
        name: 'Belligerent Test',
        belligerents: [{ name: 'Side A', type }],
      });
      expect(war.validateSync()).toBeUndefined();
    },
  );

  it('requires each belligerent to have a name', () => {
    const war = new Wars({
      slug: 'missing-side-name',
      name: 'Missing Side Name',
      belligerents: [{ type: 'kingdom' }],
    });
    expect(war.validateSync()).toBeDefined();
  });

  it('applies defaults for arrays and type', () => {
    const war = new Wars({ slug: 'defaults-war', name: 'Defaults War' });
    expect(war.type).toBe('war');
    expect(war.otherNames).toEqual([]);
    expect(war.locations).toEqual([]);
    expect(war.belligerents).toEqual([]);
    expect(war.causes).toEqual([]);
    expect(war.relatedDynasties).toEqual([]);
    expect(war.relatedRulers).toEqual([]);
    expect(war.relatedWars).toEqual([]);
    expect(war?.description?.long).toEqual([]);
    expect(war.sources).toEqual([]);
    expect(war.articles).toEqual([]);
  });

  it('declares slug as unique', () => {
    expect(Wars.schema.path('slug')?.options?.['unique']).toBe(true);
  });
});

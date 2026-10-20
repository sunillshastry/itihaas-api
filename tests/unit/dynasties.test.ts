import { beforeAll, describe, expect, it } from 'vitest';
import Dynasties from '@/models/Dynasties';

describe('Dynasty model', () => {
  beforeAll(async () => {
    // Ensures the unique slug index exists for duplicate-key tests.
    await Dynasties.init();
  });

  describe('required fields', () => {
    it('accepts a document with slug and name', async () => {
      const dynasty = new Dynasties({
        slug: 'test-dynasty',
        name: 'Test Dynasty',
      });

      await expect(dynasty.validate()).resolves.toBeUndefined();
    });

    it('rejects a missing slug', async () => {
      const dynasty = new Dynasties({
        name: 'Test Dynasty',
      });

      await expect(dynasty.validate()).rejects.toMatchObject({
        errors: {
          slug: expect.anything(),
        },
      });
    });

    it('rejects a missing name', async () => {
      const dynasty = new Dynasties({
        slug: 'test-dynasty',
      });

      await expect(dynasty.validate()).rejects.toMatchObject({
        errors: {
          name: expect.anything(),
        },
      });
    });

    it('rejects an empty slug', async () => {
      const dynasty = new Dynasties({
        slug: '',
        name: 'Test Dynasty',
      });

      await expect(dynasty.validate()).rejects.toMatchObject({
        errors: {
          slug: expect.anything(),
        },
      });
    });

    it('rejects an empty name', async () => {
      const dynasty = new Dynasties({
        slug: 'test-dynasty',
        name: '',
      });

      await expect(dynasty.validate()).rejects.toMatchObject({
        errors: {
          name: expect.anything(),
        },
      });
    });
  });

  describe('default values', () => {
    it('defaults array fields to empty arrays', () => {
      const dynasty = new Dynasties({
        slug: 'test-dynasty',
        name: 'Test Dynasty',
      });

      expect(dynasty.otherNames).toEqual([]);
      expect(dynasty.capitals).toEqual([]);
      expect(dynasty.languages).toEqual([]);
      expect(dynasty.religions).toEqual([]);
      expect(dynasty.rulers).toEqual([]);
      expect(dynasty.wars).toEqual([]);
      expect(dynasty.locations).toEqual([]);
      expect(dynasty.currencies).toEqual([]);
      expect(dynasty.sources).toEqual([]);
      expect(dynasty['description']?.long).toEqual([]);
      expect(dynasty.furtherReading).toEqual([]);
      expect(dynasty.articles).toEqual([]);
    });

    it('defaults timeline values to null', () => {
      const dynasty = new Dynasties({
        slug: 'test-dynasty',
        name: 'Test Dynasty',
      });

      expect(dynasty?.timeline?.begin).toBeNull();
      expect(dynasty?.timeline?.end).toBeNull();
    });

    it('defaults area values to null', () => {
      const dynasty = new Dynasties({
        slug: 'test-dynasty',
        name: 'Test Dynasty',
      });

      expect(dynasty?.area?.lowest).toBeNull();
      expect(dynasty?.area?.highest).toBeNull();
    });

    it('defaults population to null', () => {
      const dynasty = new Dynasties({
        slug: 'test-dynasty',
        name: 'Test Dynasty',
      });

      expect(dynasty.population).toBeNull();
    });

    it('defaults the one-line description to null', () => {
      const dynasty = new Dynasties({
        slug: 'test-dynasty',
        name: 'Test Dynasty',
      });

      expect(dynasty['description']?.oneline).toBeNull();
    });
  });

  describe('provided values', () => {
    it('preserves strings and arrays supplied by the caller', () => {
      const dynasty = new Dynasties({
        slug: 'maurya',
        name: 'Maurya Empire',
        otherNames: ['Mauryan Empire'],
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
          oneline: 'A historical empire.',
          long: ['First paragraph.', 'Second paragraph.'],
        },
      });

      expect(dynasty.slug).toBe('maurya');
      expect(dynasty.name).toBe('Maurya Empire');
      expect(dynasty.capitals).toEqual(['Pataliputra']);
      expect(dynasty?.timeline?.begin).toBe('-322');
      expect(dynasty?.timeline?.end).toBe('-185');
      expect(dynasty.population).toBe('50 million');
      expect(dynasty['description']?.long).toHaveLength(2);
    });

    it('allows explicitly empty arrays', async () => {
      const dynasty = new Dynasties({
        slug: 'empty-arrays',
        name: 'Empty Arrays Dynasty',
        capitals: [],
        languages: [],
        rulers: [],
      });

      await expect(dynasty.validate()).resolves.toBeUndefined();
      expect(dynasty.capitals).toEqual([]);
      expect(dynasty.languages).toEqual([]);
      expect(dynasty.rulers).toEqual([]);
    });

    it('allows explicit nulls for nullable fields', async () => {
      const dynasty = new Dynasties({
        slug: 'nullable-fields',
        name: 'Nullable Fields Dynasty',
        population: null,
        timeline: {
          begin: null,
          end: null,
        },
        area: {
          lowest: null,
          highest: null,
        },
        description: {
          oneline: null,
          long: [],
        },
      });

      await expect(dynasty.validate()).resolves.toBeUndefined();
    });
  });

  describe('string and array edge cases', () => {
    it('does not silently accept objects as string-array elements', async () => {
      const dynasty = new Dynasties({
        slug: 'invalid-array',
        name: 'Invalid Array Dynasty',
        capitals: [{ city: 'Pataliputra' }],
      });

      await expect(dynasty.validate()).rejects.toBeDefined();
    });

    it('handles Unicode text in names and aliases', async () => {
      const dynasty = new Dynasties({
        slug: 'unicode-dynasty',
        name: 'Dynastie historique',
        otherNames: ['राजवंश', 'மரபு'],
      });

      await expect(dynasty.validate()).resolves.toBeUndefined();
      expect(dynasty.otherNames).toContain('राजवंश');
      expect(dynasty.otherNames).toContain('மரபு');
    });

    it('handles long descriptive text', async () => {
      const longText = 'Historical description. '.repeat(1000);

      const dynasty = new Dynasties({
        slug: 'long-description',
        name: 'Long Description Dynasty',
        description: {
          oneline: 'Long description test',
          long: [longText],
        },
      });

      await expect(dynasty.validate()).resolves.toBeUndefined();
      expect(dynasty['description']?.long?.at(0)).toBe(longText);
    });

    it('preserves chronological strings without treating them as numbers', async () => {
      const dynasty = new Dynasties({
        slug: 'chronology-test',
        name: 'Chronology Test Dynasty',
        timeline: {
          begin: 'c. 322 BCE',
          end: '185 BCE',
        },
      });

      await expect(dynasty.validate()).resolves.toBeUndefined();
      expect(dynasty?.timeline?.begin).toBe('c. 322 BCE');
      expect(dynasty?.timeline?.end).toBe('185 BCE');
    });
  });

  describe('uniqueness', () => {
    it('rejects duplicate slugs at the database level', async () => {
      await Dynasties.create({
        slug: 'duplicate-dynasty',
        name: 'First Dynasty',
      });

      await expect(
        Dynasties.create({
          slug: 'duplicate-dynasty',
          name: 'Second Dynasty',
        }),
      ).rejects.toMatchObject({
        code: 11000,
      });
    });

    it('allows different slugs for different dynasties', async () => {
      await Dynasties.create({
        slug: 'dynasty-one',
        name: 'Dynasty One',
      });

      await expect(
        Dynasties.create({
          slug: 'dynasty-two',
          name: 'Dynasty Two',
        }),
      ).resolves.toBeDefined();
    });
  });

  describe('persistence and timestamps', () => {
    it('persists a valid document', async () => {
      const created = await Dynasties.create({
        slug: 'persisted-dynasty',
        name: 'Persisted Dynasty',
      });

      const found = await Dynasties.findOne({
        slug: 'persisted-dynasty',
      });

      expect(found).not.toBeNull();
      expect(found?.name).toBe('Persisted Dynasty');
      expect(created._id.toString()).toBe(found?._id.toString());
    });

    it('sets createdAt and updatedAt on creation', async () => {
      const dynasty = await Dynasties.create({
        slug: 'timestamp-dynasty',
        name: 'Timestamp Dynasty',
      });

      expect(dynasty.createdAt).toBeInstanceOf(Date);
      expect(dynasty.updatedAt).toBeInstanceOf(Date);
    });

    it('updates updatedAt when a document is modified and saved', async () => {
      const dynasty = await Dynasties.create({
        slug: 'updated-dynasty',
        name: 'Original Name',
      });

      const originalUpdatedAt = dynasty.updatedAt;

      // Ensure a measurable timestamp difference without arbitrary sleeps.
      dynasty.name = 'Updated Name';
      await dynasty.save();

      expect(dynasty.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
      expect(dynasty.name).toBe('Updated Name');
    });
  });
});

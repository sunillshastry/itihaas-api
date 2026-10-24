import { describe, expect, it } from 'vitest';
import checkValidQueryField from '@/utils/checkValidQueryField';

describe('checkValidQueryField utility', () => {
  const allowedFields = [
    'description',
    'causes',
    'sources',
    'readings',
    'articles',
  ];

  describe('matching field checks', () => {
    it('returns true when field is in the list', () => {
      expect(checkValidQueryField(allowedFields, 'description')).toBe(true);
      expect(checkValidQueryField(allowedFields, 'causes')).toBe(true);
      expect(checkValidQueryField(allowedFields, 'articles')).toBe(true);
    });

    it('returns true for single-element list containing the field', () => {
      expect(checkValidQueryField(['timeline'], 'timeline')).toBe(true);
    });
  });

  describe('non-matching field checks', () => {
    it('returns false when field is not in the list', () => {
      expect(checkValidQueryField(allowedFields, 'nonExistentField')).toBe(
        false,
      );
      expect(checkValidQueryField(allowedFields, 'unknown')).toBe(false);
    });

    it('returns false when fields list is empty', () => {
      expect(checkValidQueryField([], 'description')).toBe(false);
      expect(checkValidQueryField([], '')).toBe(false);
    });

    it('returns false for partial/substring matches of a valid field', () => {
      expect(checkValidQueryField(allowedFields, 'desc')).toBe(false);
      expect(checkValidQueryField(allowedFields, 'cause')).toBe(false);
      expect(checkValidQueryField(allowedFields, 'art')).toBe(false);
    });

    it('returns false for superstrings containing a valid field', () => {
      expect(checkValidQueryField(allowedFields, 'descriptions')).toBe(false);
      expect(checkValidQueryField(allowedFields, 'causesExtra')).toBe(false);
    });
  });

  describe('case and whitespace sensitivity', () => {
    it('is case sensitive and rejects different casings', () => {
      expect(checkValidQueryField(allowedFields, 'Description')).toBe(false);
      expect(checkValidQueryField(allowedFields, 'CAUSES')).toBe(false);
      expect(checkValidQueryField(allowedFields, 'Articles')).toBe(false);
    });

    it('is whitespace sensitive and rejects untrimmed query strings', () => {
      expect(checkValidQueryField(allowedFields, ' description')).toBe(false);
      expect(checkValidQueryField(allowedFields, 'causes ')).toBe(false);
      expect(checkValidQueryField(allowedFields, ' articles ')).toBe(false);
      expect(checkValidQueryField(allowedFields, '\tdescription\n')).toBe(
        false,
      );
    });
  });

  describe('edge and boundary cases', () => {
    it('returns false for empty string when not in list', () => {
      expect(checkValidQueryField(allowedFields, '')).toBe(false);
    });

    it('returns true for empty string when explicitly in list', () => {
      expect(checkValidQueryField(['', 'name'], '')).toBe(true);
    });

    it('handles special characters, dashes, dots, and underscores', () => {
      const specialFields = [
        'user_id',
        'created-at',
        'description.long',
        'field$special',
      ];
      expect(checkValidQueryField(specialFields, 'user_id')).toBe(true);
      expect(checkValidQueryField(specialFields, 'created-at')).toBe(true);
      expect(checkValidQueryField(specialFields, 'description.long')).toBe(
        true,
      );
      expect(checkValidQueryField(specialFields, 'field$special')).toBe(true);
      expect(checkValidQueryField(specialFields, 'description.short')).toBe(
        false,
      );
    });

    it('handles numeric string values', () => {
      const numericFields = ['0', '1', '404', '500'];
      expect(checkValidQueryField(numericFields, '0')).toBe(true);
      expect(checkValidQueryField(numericFields, '404')).toBe(true);
      expect(checkValidQueryField(numericFields, '200')).toBe(false);
    });
  });
});

import { describe, expect, it } from 'vitest';
import convertStringToBoolean from '@/utils/convertStringToBoolean';

describe('convertStringToBoolean utility', () => {
  describe('truthy conversions', () => {
    it('returns true for literal "true"', () => {
      expect(convertStringToBoolean('true')).toBe(true);
    });

    it('returns true regardless of casing', () => {
      expect(convertStringToBoolean('True')).toBe(true);
      expect(convertStringToBoolean('TRUE')).toBe(true);
      expect(convertStringToBoolean('TrUe')).toBe(true);
      expect(convertStringToBoolean('tRuE')).toBe(true);
    });

    it('returns true when surrounded by whitespace', () => {
      expect(convertStringToBoolean(' true')).toBe(true);
      expect(convertStringToBoolean('true ')).toBe(true);
      expect(convertStringToBoolean('  true  ')).toBe(true);
      expect(convertStringToBoolean('\ttrue\n')).toBe(true);
      expect(convertStringToBoolean('  TRUE  \r\n')).toBe(true);
    });
  });

  describe('falsy conversions', () => {
    it('returns false for literal "false" in various casings', () => {
      expect(convertStringToBoolean('false')).toBe(false);
      expect(convertStringToBoolean('False')).toBe(false);
      expect(convertStringToBoolean('FALSE')).toBe(false);
      expect(convertStringToBoolean('  false  ')).toBe(false);
    });

    it('returns false for empty and whitespace-only strings', () => {
      expect(convertStringToBoolean('')).toBe(false);
      expect(convertStringToBoolean(' ')).toBe(false);
      expect(convertStringToBoolean('    ')).toBe(false);
      expect(convertStringToBoolean('\t\n\r')).toBe(false);
    });

    it('returns false for numeric strings', () => {
      expect(convertStringToBoolean('1')).toBe(false);
      expect(convertStringToBoolean('0')).toBe(false);
      expect(convertStringToBoolean('-1')).toBe(false);
    });

    it('returns false for boolean-like words', () => {
      expect(convertStringToBoolean('yes')).toBe(false);
      expect(convertStringToBoolean('no')).toBe(false);
      expect(convertStringToBoolean('on')).toBe(false);
      expect(convertStringToBoolean('off')).toBe(false);
      expect(convertStringToBoolean('y')).toBe(false);
      expect(convertStringToBoolean('n')).toBe(false);
    });

    it('returns false for literal representations of falsy keywords', () => {
      expect(convertStringToBoolean('null')).toBe(false);
      expect(convertStringToBoolean('undefined')).toBe(false);
      expect(convertStringToBoolean('NaN')).toBe(false);
    });
  });

  describe('boundary and substring cases', () => {
    it('returns false when "true" is embedded within other characters', () => {
      expect(convertStringToBoolean('truee')).toBe(false);
      expect(convertStringToBoolean('truth')).toBe(false);
      expect(convertStringToBoolean('true1')).toBe(false);
      expect(convertStringToBoolean('not true')).toBe(false);
      expect(convertStringToBoolean('true false')).toBe(false);
      expect(convertStringToBoolean('is_true')).toBe(false);
    });

    it('returns false for arbitrary words and punctuation', () => {
      expect(convertStringToBoolean('hello')).toBe(false);
      expect(convertStringToBoolean('!true')).toBe(false);
      expect(convertStringToBoolean('true!')).toBe(false);
      expect(convertStringToBoolean('?')).toBe(false);
    });
  });
});

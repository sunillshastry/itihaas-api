import { describe, expect, it } from 'vitest';
import generateApiKey from '@/utils/generateApiKey';

describe('generateApiKey utility', () => {
  describe('default behavior', () => {
    it('generates a 100-character hexadecimal string by default (50 bytes)', () => {
      const apiKey = generateApiKey();
      expect(typeof apiKey).toBe('string');
      expect(apiKey).toHaveLength(100);
      expect(apiKey).toMatch(/^[0-9a-f]{100}$/);
    });
  });

  describe('custom lengths', () => {
    it('generates a hex string of length equal to 2 * specified byte count', () => {
      expect(generateApiKey(1)).toHaveLength(2);
      expect(generateApiKey(8)).toHaveLength(16);
      expect(generateApiKey(16)).toHaveLength(32);
      expect(generateApiKey(32)).toHaveLength(64);
      expect(generateApiKey(64)).toHaveLength(128);
    });

    it('returns an empty string when length is 0', () => {
      const apiKey = generateApiKey(0);
      expect(apiKey).toBe('');
      expect(apiKey).toHaveLength(0);
    });
  });

  describe('character format and entropy', () => {
    it('contains only lowercase hexadecimal characters', () => {
      const apiKey = generateApiKey(40);
      expect(apiKey).toMatch(/^[0-9a-f]+$/);
      expect(apiKey).not.toMatch(/[^0-9a-f]/);
      expect(apiKey).not.toMatch(/[A-F]/);
    });

    it('generates unique keys across multiple invocations', () => {
      const keysCount = 50;
      const keySet = new Set<string>();

      for (let i = 0; i < keysCount; i += 1) {
        keySet.add(generateApiKey());
      }

      expect(keySet.size).toBe(keysCount);
    });

    it('generates different keys on consecutive calls with custom lengths', () => {
      const key1 = generateApiKey(16);
      const key2 = generateApiKey(16);
      expect(key1).not.toBe(key2);
    });
  });
});

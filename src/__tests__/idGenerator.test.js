import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateId } from '../utils/idGenerator';

describe('idGenerator', () => {
  const mockUuid = '12345678-1234-1234-1234-123456789012';

  beforeEach(() => {
    vi.stubGlobal('crypto', {
      randomUUID: () => mockUuid
    });
  });

  describe('generateId', () => {
    it('should generate an ID with a prefix', () => {
      const result = generateId('t');
      expect(result).toBe(`t${mockUuid}`);
    });

    it('should generate an ID without a prefix if not provided', () => {
      const result = generateId();
      expect(result).toBe(mockUuid);
    });

    it('should generate an ID with an empty prefix', () => {
      const result = generateId('');
      expect(result).toBe(mockUuid);
    });

    it('should generate different IDs if crypto.randomUUID returns different values (sanity check)', () => {
      let count = 0;
      const uuids = ['uuid1', 'uuid2'];
      vi.stubGlobal('crypto', {
        randomUUID: () => uuids[count++]
      });

      expect(generateId()).toBe('uuid1');
      expect(generateId()).toBe('uuid2');
    });
  });
});

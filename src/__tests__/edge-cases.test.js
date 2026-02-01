import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../utils/api';
import { propertyService } from '../db/services/propertyService';
import { tenantService } from '../db/services/tenantService';
import { contactService } from '../db/services/contactService';

vi.mock('../utils/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty Data Handling', () => {
    it('should handle empty array response for getAll', async () => {
      api.get.mockResolvedValueOnce([]);

      const result = await propertyService.getAll();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle undefined response gracefully', async () => {
      api.get.mockResolvedValueOnce(undefined);

      const result = await propertyService.getAll();

      expect(result).toBeUndefined();
    });

    it('should handle null response', async () => {
      api.get.mockResolvedValueOnce(null);

      const result = await propertyService.getAll();

      expect(result).toBeNull();
    });
  });

  describe('Null and Undefined Field Values', () => {
    it('should handle property with null fields', async () => {
      const propertyWithNulls = {
        id: 'p1',
        name: 'Test Property',
        location: null,
        coldRent: null,
        nebenkosten: null,
        size: null,
        status: 'Vacant'
      };
      api.get.mockResolvedValueOnce(propertyWithNulls);

      const result = await propertyService.getById('p1');

      expect(result.name).toBe('Test Property');
      expect(result.location).toBeNull();
      expect(result.coldRent).toBeNull();
    });

    it('should handle tenant with undefined optional fields', async () => {
      const tenantWithUndefined = {
        id: 't1',
        name: 'John Doe',
        email: undefined,
        phone: undefined,
        propertyId: 'p1'
      };
      api.get.mockResolvedValueOnce(tenantWithUndefined);

      const result = await tenantService.getById('t1');

      expect(result.name).toBe('John Doe');
      expect(result.email).toBeUndefined();
    });

    it('should handle contact with empty string fields', async () => {
      const contactWithEmpty = {
        id: 'c1',
        name: '',
        role: '',
        email: '',
        phone: ''
      };
      api.get.mockResolvedValueOnce(contactWithEmpty);

      const result = await contactService.getById('c1');

      expect(result.name).toBe('');
      expect(result.role).toBe('');
    });
  });

  describe('Special Characters in Data', () => {
    it('should handle property name with special characters', async () => {
      const propertyWithSpecialChars = {
        id: 'p1',
        name: "O'Brien's <House> & \"Apartment\"",
        location: 'Berlin'
      };
      api.post.mockResolvedValueOnce(propertyWithSpecialChars);

      const result = await propertyService.create(propertyWithSpecialChars);

      expect(result.name).toBe("O'Brien's <House> & \"Apartment\"");
    });

    it('should handle unicode characters in names', async () => {
      const propertyWithUnicode = {
        id: 'p1',
        name: 'Müller Straße 日本語 emoji',
        location: 'München'
      };
      api.post.mockResolvedValueOnce(propertyWithUnicode);

      const result = await propertyService.create(propertyWithUnicode);

      expect(result.name).toContain('Müller');
      expect(result.name).toContain('日本語');
    });

    it('should handle newlines and tabs in text fields', async () => {
      const propertyWithWhitespace = {
        id: 'p1',
        name: 'Test\nProperty\tName',
        notes: 'Line 1\nLine 2\n\tIndented'
      };
      api.post.mockResolvedValueOnce(propertyWithWhitespace);

      const result = await propertyService.create(propertyWithWhitespace);

      expect(result.name).toContain('\n');
      expect(result.notes).toContain('\t');
    });
  });

  describe('Numeric Edge Cases', () => {
    it('should handle zero values for numeric fields', async () => {
      const propertyWithZeros = {
        id: 'p1',
        name: 'Free Property',
        coldRent: 0,
        nebenkosten: 0,
        size: 0,
        occupants: 0
      };
      api.post.mockResolvedValueOnce(propertyWithZeros);

      const result = await propertyService.create(propertyWithZeros);

      expect(result.coldRent).toBe(0);
      expect(result.size).toBe(0);
    });

    it('should handle very large numeric values', async () => {
      const propertyWithLargeNumbers = {
        id: 'p1',
        name: 'Luxury Property',
        coldRent: 999999999.99,
        size: 10000
      };
      api.post.mockResolvedValueOnce(propertyWithLargeNumbers);

      const result = await propertyService.create(propertyWithLargeNumbers);

      expect(result.coldRent).toBe(999999999.99);
    });

    it('should handle decimal precision', async () => {
      const propertyWithDecimals = {
        id: 'p1',
        name: 'Test',
        coldRent: 1234.56789
      };
      api.post.mockResolvedValueOnce(propertyWithDecimals);

      const result = await propertyService.create(propertyWithDecimals);

      expect(result.coldRent).toBeCloseTo(1234.56789, 5);
    });

    it('should handle negative numbers (even if invalid)', async () => {
      const propertyWithNegative = {
        id: 'p1',
        name: 'Test',
        coldRent: -100
      };
      api.post.mockResolvedValueOnce(propertyWithNegative);

      const result = await propertyService.create(propertyWithNegative);

      expect(result.coldRent).toBe(-100);
    });
  });

  describe('ID Edge Cases', () => {
    it('should handle very long IDs', async () => {
      const longId = 'a'.repeat(100);
      api.get.mockResolvedValueOnce({ id: longId, name: 'Test' });

      const result = await propertyService.getById(longId);

      expect(result.id).toBe(longId);
      expect(api.get).toHaveBeenCalledWith(`/properties/${longId}`);
    });

    it('should handle IDs with special characters', async () => {
      const specialId = 'test-id_123.456';
      api.get.mockResolvedValueOnce({ id: specialId, name: 'Test' });

      const result = await propertyService.getById(specialId);

      expect(result.id).toBe(specialId);
    });

    it('should handle numeric string IDs', async () => {
      const numericId = '12345';
      api.get.mockResolvedValueOnce({ id: numericId, name: 'Test' });

      const result = await propertyService.getById(numericId);

      expect(result.id).toBe('12345');
    });
  });

  describe('Array Field Edge Cases', () => {
    it('should handle empty arrays in nested fields', async () => {
      const tenantWithEmptyArrays = {
        id: 't1',
        name: 'John',
        paymentHistory: []
      };
      api.get.mockResolvedValueOnce(tenantWithEmptyArrays);

      const result = await tenantService.getById('t1');

      expect(result.paymentHistory).toEqual([]);
    });

    it('should handle arrays with null items', async () => {
      const tenantWithNullItems = {
        id: 't1',
        name: 'John',
        paymentHistory: [
          { date: '2024-01-01', amount: 1000 },
          null,
          { date: '2024-02-01', amount: 1000 }
        ]
      };
      api.get.mockResolvedValueOnce(tenantWithNullItems);

      const result = await tenantService.getById('t1');

      expect(result.paymentHistory).toHaveLength(3);
      expect(result.paymentHistory[1]).toBeNull();
    });

    it('should handle large arrays', async () => {
      const largePaymentHistory = Array.from({ length: 1000 }, (_, i) => ({
        date: `2024-01-${String(i % 28 + 1).padStart(2, '0')}`,
        amount: 1000 + i
      }));

      const tenantWithLargeArray = {
        id: 't1',
        name: 'Long-term Tenant',
        paymentHistory: largePaymentHistory
      };
      api.get.mockResolvedValueOnce(tenantWithLargeArray);

      const result = await tenantService.getById('t1');

      expect(result.paymentHistory).toHaveLength(1000);
    });
  });

  describe('Date Edge Cases', () => {
    it('should handle ISO date strings', async () => {
      const tenantWithDates = {
        id: 't1',
        name: 'John',
        leaseStart: '2024-01-01T00:00:00.000Z',
        leaseEnd: '2025-01-01T00:00:00.000Z'
      };
      api.get.mockResolvedValueOnce(tenantWithDates);

      const result = await tenantService.getById('t1');

      expect(result.leaseStart).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should handle simple date strings', async () => {
      const tenantWithSimpleDates = {
        id: 't1',
        name: 'John',
        leaseStart: '2024-01-01',
        leaseEnd: '2025-01-01'
      };
      api.get.mockResolvedValueOnce(tenantWithSimpleDates);

      const result = await tenantService.getById('t1');

      expect(result.leaseStart).toBe('2024-01-01');
    });

    it('should handle null date fields', async () => {
      const tenantWithNullDates = {
        id: 't1',
        name: 'John',
        leaseStart: '2024-01-01',
        leaseEnd: null  // Open-ended lease
      };
      api.get.mockResolvedValueOnce(tenantWithNullDates);

      const result = await tenantService.getById('t1');

      expect(result.leaseEnd).toBeNull();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle rapid sequential creates', async () => {
      const properties = Array.from({ length: 5 }, (_, i) => ({
        id: `p${i}`,
        name: `Property ${i}`
      }));

      properties.forEach((p, i) => {
        api.post.mockResolvedValueOnce(properties[i]);
      });

      const results = [];
      for (const prop of properties) {
        results.push(await propertyService.create(prop));
      }

      expect(results).toHaveLength(5);
      expect(api.post).toHaveBeenCalledTimes(5);
    });

    it('should handle parallel creates', async () => {
      const properties = Array.from({ length: 5 }, (_, i) => ({
        id: `p${i}`,
        name: `Property ${i}`
      }));

      api.post.mockImplementation((_, data) =>
        Promise.resolve({ ...data, id: data.id || 'generated' })
      );

      const results = await Promise.all(
        properties.map(p => propertyService.create(p))
      );

      expect(results).toHaveLength(5);
    });
  });

  describe('Update Edge Cases', () => {
    it('should handle partial updates with only one field', async () => {
      const updatedProperty = { id: 'p1', name: 'Updated Name', location: 'Berlin' };
      api.put.mockResolvedValueOnce(updatedProperty);

      const result = await propertyService.update('p1', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
      expect(api.put).toHaveBeenCalledWith('/properties/p1', { name: 'Updated Name' });
    });

    it('should handle update with empty object', async () => {
      api.put.mockResolvedValueOnce({ id: 'p1', name: 'Original' });

      await propertyService.update('p1', {});

      expect(api.put).toHaveBeenCalledWith('/properties/p1', {});
    });

    it('should handle update setting field to null', async () => {
      api.put.mockResolvedValueOnce({ id: 'p1', name: 'Test', notes: null });

      const result = await propertyService.update('p1', { notes: null });

      expect(result.notes).toBeNull();
    });
  });

  describe('Delete Edge Cases', () => {
    it('should handle delete of already deleted item', async () => {
      api.delete.mockRejectedValueOnce(new Error('API call failed: Not Found'));

      await expect(propertyService.delete('nonexistent')).rejects.toThrow('Not Found');
    });

    it('should return success response on valid delete', async () => {
      api.delete.mockResolvedValueOnce({ success: true });

      const result = await propertyService.delete('p1');

      expect(result).toEqual({ success: true });
    });
  });
});

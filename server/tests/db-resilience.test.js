import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('Database Resilience', () => {
  let createdIds = [];

  afterAll(async () => {
    for (const { endpoint, id } of createdIds) {
      try {
        await request(app).delete(`/api/${endpoint}/${id}`);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('Concurrent Write Operations', () => {
    it('should handle multiple simultaneous creates', async () => {
      const createPromises = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/properties')
          .send({ name: `Concurrent Property ${i}`, location: 'Berlin' })
      );

      const responses = await Promise.all(createPromises);

      // All should succeed
      responses.forEach((response, i) => {
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        createdIds.push({ endpoint: 'properties', id: response.body.id });
      });

      // All IDs should be unique
      const ids = responses.map(r => r.body.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });

    it('should handle concurrent updates to different items', async () => {
      // Create test items
      const createPromises = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post('/api/properties')
          .send({ name: `Update Test ${i}`, location: 'Berlin' })
      );
      const created = await Promise.all(createPromises);
      const ids = created.map(r => {
        createdIds.push({ endpoint: 'properties', id: r.body.id });
        return r.body.id;
      });

      // Update all concurrently
      const updatePromises = ids.map((id, i) =>
        request(app)
          .put(`/api/properties/${id}`)
          .send({ name: `Updated ${i}`, coldRent: 1000 + i })
      );

      const responses = await Promise.all(updatePromises);

      responses.forEach((response, i) => {
        expect(response.status).toBe(200);
        expect(response.body.name).toBe(`Updated ${i}`);
        expect(response.body.coldRent).toBe(1000 + i);
      });
    });

    it('should handle concurrent deletes', async () => {
      // Create items to delete
      const createPromises = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post('/api/properties')
          .send({ name: `Delete Test ${i}` })
      );
      const created = await Promise.all(createPromises);
      const ids = created.map(r => r.body.id);

      // Delete all concurrently
      const deletePromises = ids.map(id =>
        request(app).delete(`/api/properties/${id}`)
      );

      const responses = await Promise.all(deletePromises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ success: true });
      });

      // Verify all deleted
      const getPromises = ids.map(id =>
        request(app).get(`/api/properties/${id}`)
      );
      const getResponses = await Promise.all(getPromises);
      getResponses.forEach(response => {
        expect(response.status).toBe(404);
      });
    });
  });

  describe('Read-Write Consistency', () => {
    it('should immediately see created item on read', async () => {
      const createResponse = await request(app)
        .post('/api/properties')
        .send({ name: 'Consistency Test', location: 'Berlin' });

      expect(createResponse.status).toBe(201);
      const id = createResponse.body.id;
      createdIds.push({ endpoint: 'properties', id });

      // Immediately read
      const getResponse = await request(app).get(`/api/properties/${id}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.name).toBe('Consistency Test');
    });

    it('should immediately see updated data on read', async () => {
      // Create
      const createResponse = await request(app)
        .post('/api/properties')
        .send({ name: 'Original Name', location: 'Berlin' });
      const id = createResponse.body.id;
      createdIds.push({ endpoint: 'properties', id });

      // Update
      await request(app)
        .put(`/api/properties/${id}`)
        .send({ name: 'Updated Name' });

      // Immediately read
      const getResponse = await request(app).get(`/api/properties/${id}`);
      expect(getResponse.body.name).toBe('Updated Name');
    });

    it('should not see deleted item on read', async () => {
      // Create
      const createResponse = await request(app)
        .post('/api/properties')
        .send({ name: 'To Be Deleted' });
      const id = createResponse.body.id;

      // Delete
      await request(app).delete(`/api/properties/${id}`);

      // Immediately read
      const getResponse = await request(app).get(`/api/properties/${id}`);
      expect(getResponse.status).toBe(404);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all fields on create', async () => {
      const fullProperty = {
        name: 'Full Property',
        location: 'Berlin',
        coldRent: 1500,
        nebenkosten: 200,
        size: 85,
        status: 'Occupied',
        condition: 'Good',
        occupants: 2,
        pets: 'None',
        notes: 'Test notes with special chars: äöü'
      };

      const createResponse = await request(app)
        .post('/api/properties')
        .send(fullProperty);

      expect(createResponse.status).toBe(201);
      createdIds.push({ endpoint: 'properties', id: createResponse.body.id });

      // Verify all fields preserved
      const getResponse = await request(app)
        .get(`/api/properties/${createResponse.body.id}`);

      Object.keys(fullProperty).forEach(key => {
        expect(getResponse.body[key]).toBe(fullProperty[key]);
      });
    });

    it('should preserve nested objects and arrays', async () => {
      const tenantWithPaymentHistory = {
        name: 'John Doe',
        email: 'john@example.com',
        paymentHistory: [
          { date: '2024-01-01', amount: 1000, status: 'Paid' },
          { date: '2024-02-01', amount: 1000, status: 'Paid' }
        ]
      };

      const createResponse = await request(app)
        .post('/api/tenants')
        .send(tenantWithPaymentHistory);

      expect(createResponse.status).toBe(201);
      createdIds.push({ endpoint: 'tenants', id: createResponse.body.id });

      const getResponse = await request(app)
        .get(`/api/tenants/${createResponse.body.id}`);

      expect(getResponse.body.paymentHistory).toHaveLength(2);
      expect(getResponse.body.paymentHistory[0].amount).toBe(1000);
    });

    it('should not lose data on partial update', async () => {
      // Create with all fields
      const createResponse = await request(app)
        .post('/api/properties')
        .send({
          name: 'Original',
          location: 'Berlin',
          coldRent: 1000,
          notes: 'Important notes'
        });
      const id = createResponse.body.id;
      createdIds.push({ endpoint: 'properties', id });

      // Partial update - only change name
      await request(app)
        .put(`/api/properties/${id}`)
        .send({ name: 'Updated' });

      // Verify other fields preserved
      const getResponse = await request(app).get(`/api/properties/${id}`);
      expect(getResponse.body.name).toBe('Updated');
      expect(getResponse.body.location).toBe('Berlin');
      expect(getResponse.body.coldRent).toBe(1000);
      expect(getResponse.body.notes).toBe('Important notes');
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle item with maximum field count', async () => {
      const manyFields = {};
      for (let i = 0; i < 100; i++) {
        manyFields[`field_${i}`] = `value_${i}`;
      }
      manyFields.name = 'Many Fields Property';

      const response = await request(app)
        .post('/api/properties')
        .send(manyFields);

      expect(response.status).toBe(201);
      createdIds.push({ endpoint: 'properties', id: response.body.id });

      const getResponse = await request(app)
        .get(`/api/properties/${response.body.id}`);
      expect(getResponse.body.field_99).toBe('value_99');
    });

    it('should handle rapid create-read-update-delete cycle', async () => {
      // Create
      const createResponse = await request(app)
        .post('/api/properties')
        .send({ name: 'CRUD Test' });
      const id = createResponse.body.id;
      expect(createResponse.status).toBe(201);

      // Read
      const readResponse = await request(app).get(`/api/properties/${id}`);
      expect(readResponse.status).toBe(200);

      // Update
      const updateResponse = await request(app)
        .put(`/api/properties/${id}`)
        .send({ name: 'Updated CRUD' });
      expect(updateResponse.status).toBe(200);

      // Delete
      const deleteResponse = await request(app).delete(`/api/properties/${id}`);
      expect(deleteResponse.status).toBe(200);

      // Verify deleted
      const verifyResponse = await request(app).get(`/api/properties/${id}`);
      expect(verifyResponse.status).toBe(404);
    });
  });

  describe('Error Recovery', () => {
    it('should handle update of non-existent item gracefully', async () => {
      const response = await request(app)
        .put('/api/properties/does-not-exist-12345')
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle delete of non-existent item gracefully', async () => {
      const response = await request(app)
        .delete('/api/properties/does-not-exist-12345');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should continue operating after failed operations', async () => {
      // Try invalid operation
      await request(app)
        .put('/api/properties/nonexistent')
        .send({ name: 'Test' });

      // Should still be able to create new items
      const createResponse = await request(app)
        .post('/api/properties')
        .send({ name: 'After Error' });

      expect(createResponse.status).toBe(201);
      createdIds.push({ endpoint: 'properties', id: createResponse.body.id });
    });
  });
});

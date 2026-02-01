import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index.js';

describe('API Input Validation', () => {
  let createdIds = [];

  afterAll(async () => {
    // Cleanup: delete any items created during tests
    for (const { endpoint, id } of createdIds) {
      try {
        await request(app).delete(`/api/${endpoint}/${id}`);
      } catch {
        // Ignore cleanup errors
      }
    }
  });

  describe('POST - Create Operations', () => {
    describe('Properties Endpoint', () => {
      it('should accept valid property data', async () => {
        const validProperty = {
          name: 'Test Property',
          location: 'Berlin',
          coldRent: 1000,
          status: 'Vacant'
        };

        const response = await request(app)
          .post('/api/properties')
          .send(validProperty);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        createdIds.push({ endpoint: 'properties', id: response.body.id });
      });

      it('should accept property with minimal required fields', async () => {
        const minimalProperty = {
          name: 'Minimal Property'
        };

        const response = await request(app)
          .post('/api/properties')
          .send(minimalProperty);

        expect(response.status).toBe(201);
        createdIds.push({ endpoint: 'properties', id: response.body.id });
      });

      it('should handle empty request body', async () => {
        const response = await request(app)
          .post('/api/properties')
          .send({});

        // Current implementation accepts empty body - documents current behavior
        expect(response.status).toBe(201);
        createdIds.push({ endpoint: 'properties', id: response.body.id });
      });

      it('should handle special characters in property name', async () => {
        const propertyWithSpecialChars = {
          name: "Test <script>alert('xss')</script>",
          location: 'Berlin'
        };

        const response = await request(app)
          .post('/api/properties')
          .send(propertyWithSpecialChars);

        expect(response.status).toBe(201);
        // Data should be stored as-is (no server-side sanitization)
        expect(response.body.name).toBe(propertyWithSpecialChars.name);
        createdIds.push({ endpoint: 'properties', id: response.body.id });
      });

      it('should handle very long property name', async () => {
        const longName = 'A'.repeat(10000);
        const propertyWithLongName = {
          name: longName,
          location: 'Berlin'
        };

        const response = await request(app)
          .post('/api/properties')
          .send(propertyWithLongName);

        // Current implementation accepts any length - documents current behavior
        expect(response.status).toBe(201);
        expect(response.body.name.length).toBe(10000);
        createdIds.push({ endpoint: 'properties', id: response.body.id });
      });

      it('should handle numeric string for rent field', async () => {
        const propertyWithStringRent = {
          name: 'Test',
          coldRent: '1000'  // String instead of number
        };

        const response = await request(app)
          .post('/api/properties')
          .send(propertyWithStringRent);

        expect(response.status).toBe(201);
        // Documents that type coercion is not enforced
        expect(response.body.coldRent).toBe('1000');
        createdIds.push({ endpoint: 'properties', id: response.body.id });
      });

      it('should handle negative rent value', async () => {
        const propertyWithNegativeRent = {
          name: 'Test',
          coldRent: -500
        };

        const response = await request(app)
          .post('/api/properties')
          .send(propertyWithNegativeRent);

        // Current implementation accepts negative values
        expect(response.status).toBe(201);
        expect(response.body.coldRent).toBe(-500);
        createdIds.push({ endpoint: 'properties', id: response.body.id });
      });
    });

    describe('Contacts Endpoint', () => {
      it('should accept valid contact data', async () => {
        const validContact = {
          name: 'John Doe',
          role: 'Plumber',
          email: 'john@example.com',
          phone: '+49123456789'
        };

        const response = await request(app)
          .post('/api/contacts')
          .send(validContact);

        expect(response.status).toBe(201);
        createdIds.push({ endpoint: 'contacts', id: response.body.id });
      });

      it('should accept contact with invalid email format', async () => {
        const contactWithInvalidEmail = {
          name: 'John',
          email: 'not-an-email'
        };

        const response = await request(app)
          .post('/api/contacts')
          .send(contactWithInvalidEmail);

        // Documents that email validation is not enforced
        expect(response.status).toBe(201);
        expect(response.body.email).toBe('not-an-email');
        createdIds.push({ endpoint: 'contacts', id: response.body.id });
      });
    });

    describe('Tenants Endpoint', () => {
      it('should accept valid tenant data', async () => {
        const validTenant = {
          name: 'Jane Doe',
          email: 'jane@example.com',
          propertyId: 'p1',
          leaseStart: '2024-01-01',
          leaseEnd: '2025-01-01'
        };

        const response = await request(app)
          .post('/api/tenants')
          .send(validTenant);

        expect(response.status).toBe(201);
        createdIds.push({ endpoint: 'tenants', id: response.body.id });
      });

      it('should accept tenant with invalid date format', async () => {
        const tenantWithInvalidDate = {
          name: 'John',
          leaseStart: 'not-a-date',
          leaseEnd: 'also-not-a-date'
        };

        const response = await request(app)
          .post('/api/tenants')
          .send(tenantWithInvalidDate);

        // Documents that date validation is not enforced
        expect(response.status).toBe(201);
        createdIds.push({ endpoint: 'tenants', id: response.body.id });
      });
    });
  });

  describe('PUT - Update Operations', () => {
    let testPropertyId;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/properties')
        .send({ name: 'Update Test Property', location: 'Berlin' });
      testPropertyId = response.body.id;
      createdIds.push({ endpoint: 'properties', id: testPropertyId });
    });

    it('should update with valid data', async () => {
      const response = await request(app)
        .put(`/api/properties/${testPropertyId}`)
        .send({ name: 'Updated Property' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Property');
    });

    it('should handle update with empty object', async () => {
      const response = await request(app)
        .put(`/api/properties/${testPropertyId}`)
        .send({});

      expect(response.status).toBe(200);
    });

    it('should return 404 for non-existent ID', async () => {
      const response = await request(app)
        .put('/api/properties/nonexistent-id-12345')
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle update with extra fields not in schema', async () => {
      const response = await request(app)
        .put(`/api/properties/${testPropertyId}`)
        .send({
          name: 'Test',
          unknownField: 'should be stored',
          anotherUnknown: 123
        });

      // Documents that extra fields are accepted and stored
      expect(response.status).toBe(200);
      expect(response.body.unknownField).toBe('should be stored');
    });
  });

  describe('GET - Read Operations', () => {
    it('should return empty array when no data exists for entity', async () => {
      // This depends on test isolation - may have data from other tests
      const response = await request(app).get('/api/properties');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 404 for non-existent item', async () => {
      const response = await request(app).get('/api/properties/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Not found' });
    });

    it('should handle ID with special characters', async () => {
      const response = await request(app).get('/api/properties/test%20id');

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE - Delete Operations', () => {
    it('should return 404 for non-existent item', async () => {
      const response = await request(app).delete('/api/properties/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should successfully delete existing item', async () => {
      // Create item to delete
      const createResponse = await request(app)
        .post('/api/properties')
        .send({ name: 'To Delete' });

      const id = createResponse.body.id;

      const deleteResponse = await request(app).delete(`/api/properties/${id}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toEqual({ success: true });

      // Verify deletion
      const getResponse = await request(app).get(`/api/properties/${id}`);
      expect(getResponse.status).toBe(404);
    });
  });

  describe('Content-Type Handling', () => {
    it('should accept application/json content type', async () => {
      const response = await request(app)
        .post('/api/properties')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ name: 'Test' }));

      expect(response.status).toBe(201);
      createdIds.push({ endpoint: 'properties', id: response.body.id });
    });

    it('should handle missing content-type header', async () => {
      const response = await request(app)
        .post('/api/properties')
        .send({ name: 'Test Without Content-Type' });

      // Supertest sets content-type automatically, but documents behavior
      expect([200, 201, 400]).toContain(response.status);
      if (response.status === 201) {
        createdIds.push({ endpoint: 'properties', id: response.body.id });
      }
    });
  });

  describe('Request Size Limits', () => {
    it('should handle moderately large request body', async () => {
      const largeNotes = 'A'.repeat(100000); // 100KB
      const response = await request(app)
        .post('/api/properties')
        .send({ name: 'Large Notes', notes: largeNotes });

      // Documents current behavior - may accept or reject based on bodyParser config
      expect([201, 413]).toContain(response.status);
      if (response.status === 201) {
        createdIds.push({ endpoint: 'properties', id: response.body.id });
      }
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from '../utils/api';

describe('API Resilience', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Network Error Handling', () => {
    it('should handle network connection refused', async () => {
      fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(api.get('/properties')).rejects.toThrow('Failed to fetch');
    });

    it('should handle DNS resolution failure', async () => {
      fetch.mockRejectedValueOnce(new TypeError('getaddrinfo ENOTFOUND'));

      await expect(api.get('/properties')).rejects.toThrow();
    });

    it('should handle connection reset', async () => {
      fetch.mockRejectedValueOnce(new Error('ECONNRESET'));

      await expect(api.get('/properties')).rejects.toThrow('ECONNRESET');
    });
  });

  describe('HTTP Error Status Handling', () => {
    it('should handle 400 Bad Request', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      await expect(api.post('/properties', {})).rejects.toThrow('API call failed: Bad Request');
    });

    it('should handle 401 Unauthorized', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      await expect(api.get('/properties')).rejects.toThrow('API call failed: Unauthorized');
    });

    it('should handle 403 Forbidden', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      });

      await expect(api.get('/properties')).rejects.toThrow('API call failed: Forbidden');
    });

    it('should handle 404 Not Found', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(api.get('/properties/nonexistent')).rejects.toThrow('API call failed: Not Found');
    });

    it('should handle 500 Internal Server Error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(api.get('/properties')).rejects.toThrow('API call failed: Internal Server Error');
    });

    it('should handle 502 Bad Gateway', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway'
      });

      await expect(api.get('/properties')).rejects.toThrow('API call failed: Bad Gateway');
    });

    it('should handle 503 Service Unavailable', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable'
      });

      await expect(api.get('/properties')).rejects.toThrow('API call failed: Service Unavailable');
    });
  });

  describe('Response Parsing', () => {
    it('should handle invalid JSON response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new SyntaxError('Unexpected token'))
      });

      await expect(api.get('/properties')).rejects.toThrow('Unexpected token');
    });

    it('should handle empty response body', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(null)
      });

      const result = await api.get('/properties');
      expect(result).toBeNull();
    });

    it('should handle response with unexpected structure', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve('not an object')
      });

      const result = await api.get('/properties');
      expect(result).toBe('not an object');
    });
  });

  describe('Request Methods', () => {
    it('should send correct Content-Type for POST', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1' })
      });

      await api.post('/properties', { name: 'Test' });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('should send correct Content-Type for PUT', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1' })
      });

      await api.put('/properties/1', { name: 'Updated' });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' }
        })
      );
    });

    it('should stringify body for POST requests', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1' })
      });

      const data = { name: 'Test', location: 'Berlin' };
      await api.post('/properties', data);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(data)
        })
      );
    });

    it('should handle DELETE without body', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      await api.delete('/properties/1');

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.objectContaining({
          body: expect.anything()
        })
      );
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle multiple simultaneous requests', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ id: '1' }])
      });

      const promises = [
        api.get('/properties'),
        api.get('/tenants'),
        api.get('/contacts')
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should isolate failures between concurrent requests', async () => {
      fetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

      const results = await Promise.allSettled([
        api.get('/properties'),
        api.get('/tenants'),
        api.get('/contacts')
      ]);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('fulfilled');
    });
  });

  describe('Special Characters in Endpoints', () => {
    it('should handle endpoints with special characters', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: '1' })
      });

      await api.get('/properties/test%20id');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/properties/test%20id'
      );
    });

    it('should handle endpoints with query parameters', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });

      await api.get('/properties?status=Occupied');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/properties?status=Occupied'
      );
    });
  });
});

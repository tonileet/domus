import { describe, it, expect, beforeEach, vi } from 'vitest';
import { contactService } from '../db/services/contactService';
import { costService } from '../db/services/costService';
import { documentService } from '../db/services/documentService';
import { issueService } from '../db/services/issueService';
import { propertyService } from '../db/services/propertyService';
import { tenantService } from '../db/services/tenantService';
import { api } from '../utils/api';

vi.mock('../utils/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

const services = [
  { name: 'contactService', service: contactService, endpoint: '/contacts' },
  { name: 'costService', service: costService, endpoint: '/costs' },
  { name: 'documentService', service: documentService, endpoint: '/documents' },
  { name: 'issueService', service: issueService, endpoint: '/issues' },
  { name: 'propertyService', service: propertyService, endpoint: '/properties' },
  { name: 'tenantService', service: tenantService, endpoint: '/tenants' },
];

describe.each(services)('$name', ({ service, endpoint }) => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all items', async () => {
      const mockItems = [{ id: '1', name: 'Item 1' }];
      api.get.mockResolvedValueOnce(mockItems);

      const result = await service.getAll();
      expect(result).toEqual(mockItems);
      expect(api.get).toHaveBeenCalledWith(endpoint);
    });
  });

  describe('getById', () => {
    it('should fetch an item by ID', async () => {
      const mockItem = { id: '1', name: 'Item 1' };
      api.get.mockResolvedValueOnce(mockItem);

      const result = await service.getById('1');
      expect(result).toEqual(mockItem);
      expect(api.get).toHaveBeenCalledWith(`${endpoint}/1`);
    });
  });

  describe('create', () => {
    it('should create a new item', async () => {
      const newItem = { name: 'New Item' };
      const createdItem = { id: '2', ...newItem };
      api.post.mockResolvedValueOnce(createdItem);

      const result = await service.create(newItem);
      expect(result).toEqual(createdItem);
      expect(api.post).toHaveBeenCalledWith(endpoint, newItem);
    });
  });

  describe('update', () => {
    it('should update an existing item', async () => {
      const updates = { name: 'Updated Item' };
      const updatedItem = { id: '1', ...updates };
      api.put.mockResolvedValueOnce(updatedItem);

      const result = await service.update('1', updates);
      expect(result).toEqual(updatedItem);
      expect(api.put).toHaveBeenCalledWith(`${endpoint}/1`, updates);
    });
  });

  describe('delete', () => {
    it('should delete an item', async () => {
      api.delete.mockResolvedValueOnce({ success: true });

      const result = await service.delete('1');
      expect(result).toEqual({ success: true });
      expect(api.delete).toHaveBeenCalledWith(`${endpoint}/1`);
    });
  });

  describe('error handling', () => {
    it('should propagate errors from the API layer', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getAll()).rejects.toThrow('API Error');
    });
  });
});

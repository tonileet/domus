import { describe, it, expect, beforeEach, vi } from 'vitest';
import { tenantService } from '../db/services/tenantService';
import { api } from '../utils/api';

// Mock the api utility
vi.mock('../utils/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('tenantService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(tenantService).toBeDefined();
  });

  describe('getAll', () => {
    it('should fetch all tenants', async () => {
      const mockTenants = [{ id: '1', name: 'Tenant 1' }];
      api.get.mockResolvedValueOnce(mockTenants);

      const result = await tenantService.getAll();
      expect(result).toEqual(mockTenants);
      expect(api.get).toHaveBeenCalledWith('/tenants');
    });
  });

  describe('getById', () => {
    it('should fetch a tenant by ID', async () => {
      const mockTenant = { id: '1', name: 'Tenant 1' };
      api.get.mockResolvedValueOnce(mockTenant);

      const result = await tenantService.getById('1');
      expect(result).toEqual(mockTenant);
      expect(api.get).toHaveBeenCalledWith('/tenants/1');
    });
  });

  describe('create', () => {
    it('should create a new tenant', async () => {
      const newTenant = { name: 'New Tenant' };
      const createdTenant = { id: '2', ...newTenant };
      api.post.mockResolvedValueOnce(createdTenant);

      const result = await tenantService.create(newTenant);
      expect(result).toEqual(createdTenant);
      expect(api.post).toHaveBeenCalledWith('/tenants', newTenant);
    });
  });

  describe('update', () => {
    it('should update an existing tenant', async () => {
      const updates = { name: 'Updated Tenant' };
      const updatedTenant = { id: '1', ...updates };
      api.put.mockResolvedValueOnce(updatedTenant);

      const result = await tenantService.update('1', updates);
      expect(result).toEqual(updatedTenant);
      expect(api.put).toHaveBeenCalledWith('/tenants/1', updates);
    });
  });

  describe('delete', () => {
    it('should delete a tenant', async () => {
      api.delete.mockResolvedValueOnce({ success: true });

      const result = await tenantService.delete('1');
      expect(result).toEqual({ success: true });
      expect(api.delete).toHaveBeenCalledWith('/tenants/1');
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors from the API layer', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(tenantService.getAll()).rejects.toThrow('API Error');
    });
  });
});

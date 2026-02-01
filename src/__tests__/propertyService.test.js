import { describe, it, expect, beforeEach, vi } from 'vitest';
import { propertyService } from '../db/services/propertyService';
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

describe('propertyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(propertyService).toBeDefined();
  });

  describe('getAll', () => {
    it('should fetch all properties', async () => {
      const mockProperties = [{ id: '1', name: 'Prop 1' }];
      api.get.mockResolvedValueOnce(mockProperties);

      const result = await propertyService.getAll();
      expect(result).toEqual(mockProperties);
      expect(api.get).toHaveBeenCalledWith('/properties');
    });
  });

  describe('getById', () => {
    it('should fetch a property by ID', async () => {
      const mockProperty = { id: '1', name: 'Prop 1' };
      api.get.mockResolvedValueOnce(mockProperty);

      const result = await propertyService.getById('1');
      expect(result).toEqual(mockProperty);
      expect(api.get).toHaveBeenCalledWith('/properties/1');
    });
  });

  describe('create', () => {
    it('should create a new property', async () => {
      const newProperty = { name: 'New Prop' };
      const createdProperty = { id: '2', ...newProperty };
      api.post.mockResolvedValueOnce(createdProperty);

      const result = await propertyService.create(newProperty);
      expect(result).toEqual(createdProperty);
      expect(api.post).toHaveBeenCalledWith('/properties', newProperty);
    });
  });

  describe('update', () => {
    it('should update an existing property', async () => {
      const updates = { name: 'Updated Prop' };
      const updatedProperty = { id: '1', ...updates };
      api.put.mockResolvedValueOnce(updatedProperty);

      const result = await propertyService.update('1', updates);
      expect(result).toEqual(updatedProperty);
      expect(api.put).toHaveBeenCalledWith('/properties/1', updates);
    });
  });

  describe('delete', () => {
    it('should delete a property', async () => {
      api.delete.mockResolvedValueOnce({ success: true });

      const result = await propertyService.delete('1');
      expect(result).toEqual({ success: true });
      expect(api.delete).toHaveBeenCalledWith('/properties/1');
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors from the API layer', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(propertyService.getAll()).rejects.toThrow('API Error');
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { costService } from '../db/services/costService';
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

describe('costService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(costService).toBeDefined();
  });

  describe('getAll', () => {
    it('should fetch all costs', async () => {
      const mockCosts = [{ id: '1', amount: 100 }];
      api.get.mockResolvedValueOnce(mockCosts);

      const result = await costService.getAll();
      expect(result).toEqual(mockCosts);
      expect(api.get).toHaveBeenCalledWith('/costs');
    });
  });

  describe('getById', () => {
    it('should fetch a cost by ID', async () => {
      const mockCost = { id: '1', amount: 100 };
      api.get.mockResolvedValueOnce(mockCost);

      const result = await costService.getById('1');
      expect(result).toEqual(mockCost);
      expect(api.get).toHaveBeenCalledWith('/costs/1');
    });
  });

  describe('create', () => {
    it('should create a new cost', async () => {
      const newCost = { amount: 200 };
      const createdCost = { id: '2', ...newCost };
      api.post.mockResolvedValueOnce(createdCost);

      const result = await costService.create(newCost);
      expect(result).toEqual(createdCost);
      expect(api.post).toHaveBeenCalledWith('/costs', newCost);
    });
  });

  describe('update', () => {
    it('should update an existing cost', async () => {
      const updates = { amount: 150 };
      const updatedCost = { id: '1', ...updates };
      api.put.mockResolvedValueOnce(updatedCost);

      const result = await costService.update('1', updates);
      expect(result).toEqual(updatedCost);
      expect(api.put).toHaveBeenCalledWith('/costs/1', updates);
    });
  });

  describe('delete', () => {
    it('should delete a cost', async () => {
      api.delete.mockResolvedValueOnce({ success: true });

      const result = await costService.delete('1');
      expect(result).toEqual({ success: true });
      expect(api.delete).toHaveBeenCalledWith('/costs/1');
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors from the API layer', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(costService.getAll()).rejects.toThrow('API Error');
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { documentService } from '../db/services/documentService';
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

describe('documentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(documentService).toBeDefined();
  });

  describe('getAll', () => {
    it('should fetch all documents', async () => {
      const mockDocuments = [{ id: '1', name: 'Doc 1' }];
      api.get.mockResolvedValueOnce(mockDocuments);

      const result = await documentService.getAll();
      expect(result).toEqual(mockDocuments);
      expect(api.get).toHaveBeenCalledWith('/documents');
    });
  });

  describe('getById', () => {
    it('should fetch a document by ID', async () => {
      const mockDocument = { id: '1', name: 'Doc 1' };
      api.get.mockResolvedValueOnce(mockDocument);

      const result = await documentService.getById('1');
      expect(result).toEqual(mockDocument);
      expect(api.get).toHaveBeenCalledWith('/documents/1');
    });
  });

  describe('create', () => {
    it('should create a new document', async () => {
      const newDocument = { name: 'New Doc' };
      const createdDocument = { id: '2', ...newDocument };
      api.post.mockResolvedValueOnce(createdDocument);

      const result = await documentService.create(newDocument);
      expect(result).toEqual(createdDocument);
      expect(api.post).toHaveBeenCalledWith('/documents', newDocument);
    });
  });

  describe('update', () => {
    it('should update an existing document', async () => {
      const updates = { name: 'Updated Doc' };
      const updatedDocument = { id: '1', ...updates };
      api.put.mockResolvedValueOnce(updatedDocument);

      const result = await documentService.update('1', updates);
      expect(result).toEqual(updatedDocument);
      expect(api.put).toHaveBeenCalledWith('/documents/1', updates);
    });
  });

  describe('delete', () => {
    it('should delete a document', async () => {
      api.delete.mockResolvedValueOnce({ success: true });

      const result = await documentService.delete('1');
      expect(result).toEqual({ success: true });
      expect(api.delete).toHaveBeenCalledWith('/documents/1');
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors from the API layer', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(documentService.getAll()).rejects.toThrow('API Error');
    });
  });
});

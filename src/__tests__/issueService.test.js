import { describe, it, expect, beforeEach, vi } from 'vitest';
import { issueService } from '../db/services/issueService';
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

describe('issueService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(issueService).toBeDefined();
  });

  describe('getAll', () => {
    it('should fetch all issues', async () => {
      const mockIssues = [{ id: '1', title: 'Issue 1' }];
      api.get.mockResolvedValueOnce(mockIssues);

      const result = await issueService.getAll();
      expect(result).toEqual(mockIssues);
      expect(api.get).toHaveBeenCalledWith('/issues');
    });
  });

  describe('getById', () => {
    it('should fetch an issue by ID', async () => {
      const mockIssue = { id: '1', title: 'Issue 1' };
      api.get.mockResolvedValueOnce(mockIssue);

      const result = await issueService.getById('1');
      expect(result).toEqual(mockIssue);
      expect(api.get).toHaveBeenCalledWith('/issues/1');
    });
  });

  describe('create', () => {
    it('should create a new issue', async () => {
      const newIssue = { title: 'New Issue' };
      const createdIssue = { id: '2', ...newIssue };
      api.post.mockResolvedValueOnce(createdIssue);

      const result = await issueService.create(newIssue);
      expect(result).toEqual(createdIssue);
      expect(api.post).toHaveBeenCalledWith('/issues', newIssue);
    });
  });

  describe('update', () => {
    it('should update an existing issue', async () => {
      const updates = { title: 'Updated Issue' };
      const updatedIssue = { id: '1', ...updates };
      api.put.mockResolvedValueOnce(updatedIssue);

      const result = await issueService.update('1', updates);
      expect(result).toEqual(updatedIssue);
      expect(api.put).toHaveBeenCalledWith('/issues/1', updates);
    });
  });

  describe('delete', () => {
    it('should delete an issue', async () => {
      api.delete.mockResolvedValueOnce({ success: true });

      const result = await issueService.delete('1');
      expect(result).toEqual({ success: true });
      expect(api.delete).toHaveBeenCalledWith('/issues/1');
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors from the API layer', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(issueService.getAll()).rejects.toThrow('API Error');
    });
  });
});

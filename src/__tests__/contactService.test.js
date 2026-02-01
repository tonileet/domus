import { describe, it, expect, beforeEach, vi } from 'vitest';
import { contactService } from '../db/services/contactService';
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

describe('contactService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(contactService).toBeDefined();
  });

  describe('getAll', () => {
    it('should fetch all contacts', async () => {
      const mockContacts = [{ id: '1', name: 'Contact 1' }];
      api.get.mockResolvedValueOnce(mockContacts);

      const result = await contactService.getAll();
      expect(result).toEqual(mockContacts);
      expect(api.get).toHaveBeenCalledWith('/contacts');
    });
  });

  describe('getById', () => {
    it('should fetch a contact by ID', async () => {
      const mockContact = { id: '1', name: 'Contact 1' };
      api.get.mockResolvedValueOnce(mockContact);

      const result = await contactService.getById('1');
      expect(result).toEqual(mockContact);
      expect(api.get).toHaveBeenCalledWith('/contacts/1');
    });
  });

  describe('create', () => {
    it('should create a new contact', async () => {
      const newContact = { name: 'New Contact' };
      const createdContact = { id: '2', ...newContact };
      api.post.mockResolvedValueOnce(createdContact);

      const result = await contactService.create(newContact);
      expect(result).toEqual(createdContact);
      expect(api.post).toHaveBeenCalledWith('/contacts', newContact);
    });
  });

  describe('update', () => {
    it('should update an existing contact', async () => {
      const updates = { name: 'Updated Contact' };
      const updatedContact = { id: '1', ...updates };
      api.put.mockResolvedValueOnce(updatedContact);

      const result = await contactService.update('1', updates);
      expect(result).toEqual(updatedContact);
      expect(api.put).toHaveBeenCalledWith('/contacts/1', updates);
    });
  });

  describe('delete', () => {
    it('should delete a contact', async () => {
      api.delete.mockResolvedValueOnce({ success: true });

      const result = await contactService.delete('1');
      expect(result).toEqual({ success: true });
      expect(api.delete).toHaveBeenCalledWith('/contacts/1');
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors from the API layer', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(contactService.getAll()).rejects.toThrow('API Error');
    });
  });
});

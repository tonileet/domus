import { api } from '../../utils/api';

export const documentService = {
    // Get all documents
    async getAll() {
        return await api.get('/documents');
    },

    // Get document by ID
    async getById(id) {
        return await api.get(`/documents/${id}`);
    },

    // Create new document
    async create(document) {
        return await api.post('/documents', document);
    },

    // Update document
    async update(id, updates) {
        return await api.put(`/documents/${id}`, updates);
    },

    // Delete document
    async delete(id) {
        return await api.delete(`/documents/${id}`);
    }
};


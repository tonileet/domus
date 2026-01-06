import db from '../database';

export const documentService = {
    // Get all documents
    async getAll() {
        return await db.documents.toArray();
    },

    // Get document by ID
    async getById(id) {
        return await db.documents.get(id);
    },

    // Create new document
    async create(document) {
        return await db.documents.add(document);
    },

    // Update document
    async update(id, updates) {
        return await db.documents.update(id, updates);
    },

    // Delete document
    async delete(id) {
        return await db.documents.delete(id);
    },

    // Get documents by category
    async getByCategory(category) {
        return await db.documents.where('category').equals(category).toArray();
    },

    // Get documents by type
    async getByType(type) {
        return await db.documents.where('type').equals(type).toArray();
    },

    // Search documents by name
    async searchByName(searchTerm) {
        return await db.documents
            .filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .toArray();
    }
};

import db from '../database';

export const propertyService = {
    // Get all properties
    async getAll() {
        return await db.properties.toArray();
    },

    // Get property by ID
    async getById(id) {
        return await db.properties.get(id);
    },

    // Create new property
    async create(property) {
        return await db.properties.add(property);
    },

    // Update property
    async update(id, updates) {
        return await db.properties.update(id, updates);
    },

    // Delete property
    async delete(id) {
        return await db.properties.delete(id);
    },

    // Get properties by status
    async getByStatus(status) {
        return await db.properties.where('status').equals(status).toArray();
    },

    // Get properties by condition
    async getByCondition(condition) {
        return await db.properties.where('condition').equals(condition).toArray();
    }
};

import db from '../database';

export const tenantService = {
    // Get all tenants
    async getAll() {
        return await db.tenants.toArray();
    },

    // Get tenant by ID
    async getById(id) {
        return await db.tenants.get(id);
    },

    // Create new tenant
    async create(tenant) {
        return await db.tenants.add(tenant);
    },

    // Update tenant
    async update(id, updates) {
        return await db.tenants.update(id, updates);
    },

    // Delete tenant
    async delete(id) {
        return await db.tenants.delete(id);
    },

    // Get tenants by property
    async getByProperty(propertyId) {
        return await db.tenants.where('propertyId').equals(propertyId).toArray();
    },

    // Get tenants by status
    async getByStatus(status) {
        return await db.tenants.where('status').equals(status).toArray();
    },

    // Get active tenants
    async getActive() {
        return await db.tenants.where('status').equals('Active').toArray();
    }
};

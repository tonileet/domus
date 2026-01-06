import db from '../database';

export const issueService = {
    // Get all issues
    async getAll() {
        return await db.issues.toArray();
    },

    // Get issue by ID
    async getById(id) {
        return await db.issues.get(id);
    },

    // Create new issue
    async create(issue) {
        return await db.issues.add(issue);
    },

    // Update issue
    async update(id, updates) {
        return await db.issues.update(id, updates);
    },

    // Delete issue
    async delete(id) {
        return await db.issues.delete(id);
    },

    // Get issues by property
    async getByProperty(propertyId) {
        return await db.issues.where('propertyId').equals(propertyId).toArray();
    },

    // Get issues by tenant
    async getByTenant(tenantId) {
        return await db.issues.where('tenantId').equals(tenantId).toArray();
    },

    // Get issues by status
    async getByStatus(status) {
        return await db.issues.where('status').equals(status).toArray();
    },

    // Get issues by priority
    async getByPriority(priority) {
        return await db.issues.where('priority').equals(priority).toArray();
    },

    // Get open issues
    async getOpen() {
        return await db.issues.where('status').equals('Open').toArray();
    }
};

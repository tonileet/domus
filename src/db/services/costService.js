import db from '../database';

export const costService = {
    // Get all costs
    async getAll() {
        return await db.costs.toArray();
    },

    // Get cost by ID
    async getById(id) {
        return await db.costs.get(id);
    },

    // Create new cost
    async create(cost) {
        return await db.costs.add(cost);
    },

    // Update cost
    async update(id, updates) {
        return await db.costs.update(id, updates);
    },

    // Delete cost
    async delete(id) {
        return await db.costs.delete(id);
    },

    // Get utility billable costs
    async getUtilityBillable() {
        return await db.costs.where('utilityBillable').equals(true).toArray();
    },

    // Get unpaid costs
    async getUnpaid() {
        return await db.costs.where('paidDate').equals(null).toArray();
    },

    // Get paid costs
    async getPaid() {
        return await db.costs.where('paidDate').notEqual(null).toArray();
    },

    // Get costs by date range
    async getByDateRange(startDate, endDate) {
        return await db.costs
            .where('dueDate')
            .between(startDate, endDate, true, true)
            .toArray();
    }
};

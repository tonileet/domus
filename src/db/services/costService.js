import { api } from '../../utils/api';

export const costService = {
    // Get all costs
    async getAll() {
        return await api.get('/costs');
    },

    // Get cost by ID
    async getById(id) {
        return await api.get(`/costs/${id}`);
    },

    // Create new cost
    async create(cost) {
        return await api.post('/costs', cost);
    },

    // Update cost
    async update(id, updates) {
        return await api.put(`/costs/${id}`, updates);
    },

    // Delete cost
    async delete(id) {
        return await api.delete(`/costs/${id}`);
    }
};


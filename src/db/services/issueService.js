import { api } from '../../utils/api';

export const issueService = {
    // Get all issues
    async getAll() {
        return await api.get('/issues');
    },

    // Get issue by ID
    async getById(id) {
        return await api.get(`/issues/${id}`);
    },

    // Create new issue
    async create(issue) {
        return await api.post('/issues', issue);
    },

    // Update issue
    async update(id, updates) {
        return await api.put(`/issues/${id}`, updates);
    },

    // Delete issue
    async delete(id) {
        return await api.delete(`/issues/${id}`);
    }
};


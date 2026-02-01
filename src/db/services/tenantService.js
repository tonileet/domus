import { api } from '../../utils/api';

export const tenantService = {
    // Get all tenants
    async getAll() {
        return await api.get('/tenants');
    },

    // Get tenant by ID
    async getById(id) {
        return await api.get(`/tenants/${id}`);
    },

    // Create new tenant
    async create(tenant) {
        return await api.post('/tenants', tenant);
    },

    // Update tenant
    async update(id, updates) {
        return await api.put(`/tenants/${id}`, updates);
    },

    // Delete tenant
    async delete(id) {
        return await api.delete(`/tenants/${id}`);
    }
};


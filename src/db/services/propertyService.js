import { api } from '../../utils/api';

export const propertyService = {
    // Get all properties
    async getAll() {
        return await api.get('/properties');
    },

    // Get property by ID
    async getById(id) {
        return await api.get(`/properties/${id}`);
    },

    // Create new property
    async create(property) {
        return await api.post('/properties', property);
    },

    // Update property
    async update(id, updates) {
        return await api.put(`/properties/${id}`, updates);
    },

    // Delete property
    async delete(id) {
        return await api.delete(`/properties/${id}`);
    }

    // Note: getByStatus and getByCondition were filtered in memory or via Dexie.
    // For now, we'll fetch all and filter client-side, or we could add query params to the API later.
    // Given the small scale, fetching all and filtering is fine for now if needed, 
    // but the original service methods `getByStatus/Condition` are rarely used directly by hooks 
    // other than for specific logic. 
    // If they are needed, we can implement them as:
    // async getByStatus(status) {
    //    const all = await this.getAll();
    //    return all.filter(p => p.status === status);
    // }
};


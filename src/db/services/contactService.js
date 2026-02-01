import { api } from '../../utils/api';

export const contactService = {
    async getAll() {
        return await api.get('/contacts');
    },

    async getById(id) {
        return await api.get(`/contacts/${id}`);
    },

    async create(contact) {
        return await api.post('/contacts', contact);
    },

    async update(id, updates) {
        return await api.put(`/contacts/${id}`, updates);
    },

    async delete(id) {
        return await api.delete(`/contacts/${id}`);
    }
};


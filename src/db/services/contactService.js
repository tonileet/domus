import db from '../database';

export const contactService = {
    async getAll() {
        return await db.contacts.toArray();
    },

    async getById(id) {
        return await db.contacts.get(id);
    },

    async create(contact) {
        return await db.contacts.add(contact);
    },

    async update(id, updates) {
        return await db.contacts.update(id, updates);
    },

    async delete(id) {
        return await db.contacts.delete(id);
    },

    async searchByName(nameQuery) {
        return await db.contacts
            .filter(contact => contact.name.toLowerCase().includes(nameQuery.toLowerCase()))
            .toArray();
    }
};

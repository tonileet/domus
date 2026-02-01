import { useState, useEffect, useCallback } from 'react';
import { contactService } from '../../db/services';
import { generateId } from '../../utils/idGenerator';

export const useContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchContacts = useCallback(async () => {
        try {
            const data = await contactService.getAll();
            setContacts(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch contacts:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const addContact = async (contactData) => {
        try {
            const newContact = {
                id: generateId('cont'),
                ...contactData
            };
            const created = await contactService.create(newContact);
            setContacts(prev => [...prev, created]);
            return created;
        } catch (err) {
            console.error('Failed to add contact:', err);
            throw err;
        }
    };

    const updateContact = async (id, updatedFields) => {
        try {
            const updated = await contactService.update(id, updatedFields);
            setContacts(prev => prev.map(c => c.id === id ? updated : c));
            return updated;
        } catch (err) {
            console.error('Failed to update contact:', err);
            throw err;
        }
    };

    const deleteContact = async (contactId) => {
        try {
            await contactService.delete(contactId);
            setContacts(prev => prev.filter(c => c.id !== contactId));
        } catch (err) {
            console.error('Failed to delete contact:', err);
            throw err;
        }
    };

    return {
        contacts,
        loading,
        error,
        addContact,
        updateContact,
        deleteContact,
        refreshContacts: fetchContacts
    };
};


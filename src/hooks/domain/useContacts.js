import { useLiveQuery } from 'dexie-react-hooks';
import { contactService } from '../../db/services';
import { generateId } from '../../utils/idGenerator';

export const useContacts = () => {
    const contacts = useLiveQuery(() => contactService.getAll(), []) || [];

    const addContact = async (contactData) => {
        try {
            const newContact = {
                id: generateId('cont'),
                ...contactData
            };
            await contactService.create(newContact);
        } catch (err) {
            console.error('Failed to add contact:', err);
            throw err;
        }
    };

    const updateContact = async (id, updatedFields) => {
        try {
            await contactService.update(id, updatedFields);
        } catch (err) {
            console.error('Failed to update contact:', err);
            throw err;
        }
    };

    const deleteContact = async (contactId) => {
        try {
            await contactService.delete(contactId);
        } catch (err) {
            console.error('Failed to delete contact:', err);
            throw err;
        }
    };

    return {
        contacts,
        addContact,
        updateContact,
        deleteContact
    };
};

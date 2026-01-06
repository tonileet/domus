import { useLiveQuery } from 'dexie-react-hooks';
import { propertyService } from '../../db/services';

export const useProperties = () => {
    const properties = useLiveQuery(() => propertyService.getAll(), []) || [];

    const updateProperty = async (id, updatedFields) => {
        try {
            await propertyService.update(id, updatedFields);
        } catch (err) {
            console.error('Failed to update property:', err);
            throw err;
        }
    };

    const addProperty = async (property) => {
        try {
            await propertyService.create(property);
        } catch (err) {
            console.error('Failed to add property:', err);
            throw err;
        }
    };

    return {
        properties,
        addProperty,
        updateProperty
    };
};

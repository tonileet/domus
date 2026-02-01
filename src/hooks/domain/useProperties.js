import { useState, useEffect, useCallback } from 'react';
import { propertyService } from '../../db/services';

export const useProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProperties = useCallback(async () => {
        try {
            const data = await propertyService.getAll();
            setProperties(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch properties:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    const updateProperty = async (id, updatedFields) => {
        try {
            const updated = await propertyService.update(id, updatedFields);
            setProperties(prev => prev.map(p => p.id === id ? updated : p));
            return updated;
        } catch (err) {
            console.error('Failed to update property:', err);
            throw err;
        }
    };

    const addProperty = async (property) => {
        try {
            const created = await propertyService.create(property);
            setProperties(prev => [...prev, created]);
            return created;
        } catch (err) {
            console.error('Failed to add property:', err);
            throw err;
        }
    };

    return {
        properties,
        loading,
        error,
        addProperty,
        updateProperty,
        refreshProperties: fetchProperties
    };
};


import { useState, useEffect, useCallback } from 'react';
import { costService } from '../../db/services';
import { generateId } from '../../utils/idGenerator';

export const useCosts = () => {
    const [costs, setCosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCosts = useCallback(async () => {
        try {
            const data = await costService.getAll();
            setCosts(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch costs:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCosts();
    }, [fetchCosts]);

    const addCost = async (costData) => {
        try {
            const newCost = {
                id: generateId('c'),
                paidDate: null,
                utilityBillable: false,
                tenantIds: [],
                attachments: [],
                ...costData
            };
            const created = await costService.create(newCost);
            setCosts(prev => [...prev, created]);
            return created;
        } catch (err) {
            console.error('Failed to add cost:', err);
            throw err;
        }
    };

    const updateCost = async (id, updatedFields) => {
        try {
            const updated = await costService.update(id, updatedFields);
            setCosts(prev => prev.map(c => c.id === id ? updated : c));
            return updated;
        } catch (err) {
            console.error('Failed to update cost:', err);
            throw err;
        }
    };

    return {
        costs,
        loading,
        error,
        addCost,
        updateCost,
        refreshCosts: fetchCosts
    };
};


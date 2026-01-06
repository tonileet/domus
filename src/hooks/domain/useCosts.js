import { useLiveQuery } from 'dexie-react-hooks';
import { costService } from '../../db/services';
import { generateId } from '../../utils/idGenerator';

export const useCosts = () => {
    const costs = useLiveQuery(() => costService.getAll(), []) || [];

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
            await costService.create(newCost);
        } catch (err) {
            console.error('Failed to add cost:', err);
            throw err;
        }
    };

    const updateCost = async (id, updatedFields) => {
        try {
            await costService.update(id, updatedFields);
        } catch (err) {
            console.error('Failed to update cost:', err);
            throw err;
        }
    };

    return {
        costs,
        addCost,
        updateCost
    };
};

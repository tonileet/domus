import { useLiveQuery } from 'dexie-react-hooks';
import { tenantService, propertyService } from '../../db/services';
import { TENANT_STATUS } from '../../constants/status';
import { generateId } from '../../utils/idGenerator';

export const useTenants = (properties = []) => {
    const tenants = useLiveQuery(() => tenantService.getAll(), []) || [];

    const addTenant = async (propertyId, tenantData) => {
        try {
            const property = properties.find(p => p.id === propertyId);
            const newTenant = {
                id: generateId('t'),
                propertyId,
                propertyName: property?.name || 'Unknown Property',
                leaseStart: new Date().toISOString().split('T')[0],
                leaseEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                status: TENANT_STATUS.ACTIVE,
                paymentHistory: [],
                ...tenantData
            };

            await tenantService.create(newTenant);

            // Update property occupant count
            if (property) {
                await propertyService.update(propertyId, {
                    occupants: (property.occupants || 0) + 1
                });
            }
        } catch (err) {
            console.error('Failed to add tenant:', err);
            throw err;
        }
    };

    const updateTenant = async (id, updatedFields) => {
        try {
            await tenantService.update(id, updatedFields);
        } catch (err) {
            console.error('Failed to update tenant:', err);
            throw err;
        }
    };

    const removeTenant = async (tenantId) => {
        try {
            const tenant = tenants.find(t => t.id === tenantId);

            // Mark tenant as past instead of deleting
            await tenantService.update(tenantId, {
                propertyId: null,
                propertyName: null,
                status: TENANT_STATUS.PAST
            });

            // Update property occupant count
            if (tenant && tenant.propertyId) {
                const property = properties.find(p => p.id === tenant.propertyId);
                if (property) {
                    await propertyService.update(property.id, {
                        occupants: Math.max(0, (property.occupants || 0) - 1)
                    });
                }
            }
        } catch (err) {
            console.error('Failed to remove tenant:', err);
            throw err;
        }
    };

    const deleteTenant = async (tenantId) => {
        try {
            const tenant = tenants.find(t => t.id === tenantId);

            // Update property occupant count before deleting
            if (tenant && tenant.propertyId) {
                const property = properties.find(p => p.id === tenant.propertyId);
                if (property) {
                    await propertyService.update(property.id, {
                        occupants: Math.max(0, (property.occupants || 0) - 1)
                    });
                }
            }

            // Permanently delete tenant from database
            await tenantService.delete(tenantId);
        } catch (err) {
            console.error('Failed to delete tenant:', err);
            throw err;
        }
    };

    return {
        tenants,
        addTenant,
        updateTenant,
        removeTenant,
        deleteTenant
    };
};

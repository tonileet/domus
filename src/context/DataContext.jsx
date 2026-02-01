import React, { createContext, useContext, useState, useEffect } from 'react';
import { seedDatabase } from '../db/migration';
import { useProperties, useTenants, useIssues, useCosts, useContacts, useDocuments } from '../hooks/domain';
import { ToastProvider } from '../components/common';

const DataContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
    return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [migrationComplete, setMigrationComplete] = useState(false);

    // Initialize database and run migration on first load
    useEffect(() => {
        const initializeDatabase = async () => {
            try {
                setLoading(true);
                const result = await seedDatabase();
                setMigrationComplete(true);

                if (!result.success) {
                    setError(result.error);
                }
            } catch (err) {
                console.error('Failed to initialize database:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        initializeDatabase();
    }, []);

    // Domain Hooks
    const { properties, addProperty, updateProperty } = useProperties();
    // Tenants need access to properties for "Unknown Property" fallback and occupant counting
    const { tenants, addTenant, updateTenant, removeTenant, deleteTenant } = useTenants(properties);
    const { issues, addIssue, updateIssue, resolveIssue } = useIssues();
    const { costs, addCost, updateCost } = useCosts();
    const { contacts, addContact, updateContact, deleteContact } = useContacts();
    const { documents } = useDocuments();

    const value = {
        // Data
        properties,
        tenants,
        documents,
        issues,
        costs,
        contacts,

        // UI State
        loading,
        error,

        // Methods
        addProperty,
        updateProperty,
        addTenant,
        updateTenant,
        removeTenant,
        deleteTenant,
        addIssue,
        resolveIssue,
        updateIssue,
        addCost,
        updateCost,
        addContact,
        updateContact,
        deleteContact
    };

    // Show loading state during initial migration
    if (loading && !migrationComplete) {
        return (
            <DataContext.Provider value={{ ...value, loading: true }}>
                {children}
            </DataContext.Provider>
        );
    }

    return (
        <ToastProvider>
            <DataContext.Provider value={value}>
                {children}
            </DataContext.Provider>
        </ToastProvider>
    );
};



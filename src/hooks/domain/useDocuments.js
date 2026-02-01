import { useState, useEffect, useCallback } from 'react';
import { documentService } from '../../db/services';

export const useDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDocuments = useCallback(async () => {
        try {
            const data = await documentService.getAll();
            setDocuments(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch documents:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const addDocument = async (docData) => {
        try {
            const created = await documentService.create(docData);
            setDocuments(prev => [...prev, created]);
            return created;
        } catch (err) {
            console.error('Failed to add document:', err);
            throw err;
        }
    };

    return {
        documents,
        loading,
        error,
        addDocument,
        refreshDocuments: fetchDocuments
    };
};


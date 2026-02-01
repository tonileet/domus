import { useState, useEffect, useCallback } from 'react';
import { issueService } from '../../db/services';
import { ISSUE_STATUS } from '../../constants/status';
import { generateId } from '../../utils/idGenerator';

export const useIssues = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchIssues = useCallback(async () => {
        try {
            const data = await issueService.getAll();
            setIssues(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch issues:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIssues();
    }, [fetchIssues]);

    const addIssue = async (issueData) => {
        try {
            const newIssue = {
                id: generateId('i'),
                createdAt: new Date().toISOString().split('T')[0],
                status: ISSUE_STATUS.OPEN,
                attachments: [],
                ...issueData
            };
            const created = await issueService.create(newIssue);
            setIssues(prev => [...prev, created]);
            return created;
        } catch (err) {
            console.error('Failed to add issue:', err);
            throw err;
        }
    };

    const updateIssue = async (id, updatedFields) => {
        try {
            const updated = await issueService.update(id, updatedFields);
            setIssues(prev => prev.map(i => i.id === id ? updated : i));
            return updated;
        } catch (err) {
            console.error('Failed to update issue:', err);
            throw err;
        }
    };

    const resolveIssue = async (issueId) => {
        try {
            const updated = await issueService.update(issueId, { status: ISSUE_STATUS.CLOSED });
            setIssues(prev => prev.map(i => i.id === issueId ? updated : i));
            return updated;
        } catch (err) {
            console.error('Failed to resolve issue:', err);
            throw err;
        }
    };

    return {
        issues,
        loading,
        error,
        addIssue,
        updateIssue,
        resolveIssue,
        refreshIssues: fetchIssues
    };
};


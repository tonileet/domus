import { useLiveQuery } from 'dexie-react-hooks';
import { issueService } from '../../db/services';
import { ISSUE_STATUS } from '../../constants/status';
import { generateId } from '../../utils/idGenerator';

export const useIssues = () => {
    const issues = useLiveQuery(() => issueService.getAll(), []) || [];

    const addIssue = async (issueData) => {
        try {
            const newIssue = {
                id: generateId('i'),
                createdAt: new Date().toISOString().split('T')[0],
                status: ISSUE_STATUS.OPEN,
                attachments: [],
                ...issueData
            };
            await issueService.create(newIssue);
        } catch (err) {
            console.error('Failed to add issue:', err);
            throw err;
        }
    };

    const updateIssue = async (id, updatedFields) => {
        try {
            await issueService.update(id, updatedFields);
        } catch (err) {
            console.error('Failed to update issue:', err);
            throw err;
        }
    };

    const resolveIssue = async (issueId) => {
        try {
            await issueService.update(issueId, { status: ISSUE_STATUS.CLOSED });
        } catch (err) {
            console.error('Failed to resolve issue:', err);
            throw err;
        }
    };

    return {
        issues,
        addIssue,
        updateIssue,
        resolveIssue
    };
};

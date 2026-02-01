import { useLiveQuery } from 'dexie-react-hooks';
import { documentService } from '../../db/services';

export const useDocuments = () => {
    const documents = useLiveQuery(() => documentService.getAll(), []) || [];

    // Placeholder for future document operations if needed
    const addDocument = async () => {
        // Implementation for future
    };

    return {
        documents,
        addDocument
    };
};

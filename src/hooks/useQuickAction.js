import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to handle "Quick Actions" navigation state.
 * Checks if the current location has state.openAdd set to true.
 * 
 * @returns {Array} [shouldOpenAdd, setShouldOpenAdd]
 */
export const useQuickAction = () => {
    const location = useLocation();
    const [shouldOpenAdd, setShouldOpenAdd] = useState(() => {
        return location.state?.openAdd === true;
    });

    useEffect(() => {
        if (location.state?.openAdd) {
            // Clear the state to prevent reopening on simple re-renders
            window.history.replaceState({}, document.title);
        }
    }, [location.state?.openAdd]);

    return [shouldOpenAdd, setShouldOpenAdd];
};

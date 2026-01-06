/**
 * Generates a unique ID with an optional prefix.
 * Uses crypto.randomUUID() for collision resistance.
 * 
 * @param {string} prefix - Optional prefix (e.g., 't', 'p', 'i')
 * @returns {string} - The generated ID
 */
export const generateId = (prefix = '') => {
    return `${prefix}${crypto.randomUUID()}`;
};

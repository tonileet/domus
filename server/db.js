import { JSONFilePreset } from 'lowdb/node';
import {
    INITIAL_PROPERTIES,
    INITIAL_TENANTS,
    INITIAL_DOCUMENTS,
    INITIAL_ISSUES,
    INITIAL_COSTS
} from './initialData.js';

// Default data if db.json is empty
const defaultData = {
    tenants: INITIAL_TENANTS,
    properties: INITIAL_PROPERTIES,
    issues: INITIAL_ISSUES,
    documents: INITIAL_DOCUMENTS,
    costs: INITIAL_COSTS,
    contacts: []
};

// Initialize DB
const db = await JSONFilePreset('db.json', defaultData);

export default db;

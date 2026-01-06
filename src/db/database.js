import Dexie from 'dexie';

export const db = new Dexie('DomusDB');

// Define database schema
db.version(1).stores({
    properties: 'id, name, status, condition, location',
    tenants: 'id, name, propertyId, status, email',
    documents: 'id, name, category, type, date',
    issues: 'id, title, propertyId, tenantId, priority, status, dueDate',
    costs: 'id, name, dueDate, paidDate, utilityBillable'
});

db.version(2).stores({
    contacts: 'id, name, description, contactInfo'
});

db.version(3).stores({
    contacts: 'id, name, role, description, contactInfo'
});

db.version(4).stores({
    properties: 'id, name, status, condition, location, size'
});

export default db;

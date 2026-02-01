import db from './database';
import {
    INITIAL_PROPERTIES,
    INITIAL_TENANTS,
    INITIAL_DOCUMENTS,
    INITIAL_ISSUES,
    INITIAL_COSTS
} from './demoData';

// WARNING: If you want to use the app for real personal data, 
// do NOT modify ./demoData.js which is tracked by Git. 
// Instead, consider creating a local seed mechanism if needed, 
// or simply use the app's UI to enter your data.

/**
 * Checks if the database has been initialized with data
 */
export async function isDatabaseEmpty() {
    const propertyCount = await db.properties.count();
    return propertyCount === 0;
}

/**
 * Seeds the database with mock data
 * This should only run once on first app load
 */
export async function seedDatabase() {
    try {
        // Check if already seeded
        const isEmpty = await isDatabaseEmpty();
        if (!isEmpty) {
            return { success: true, alreadySeeded: true };
        }

        // Seed all tables
        await db.transaction('rw', db.properties, db.tenants, db.documents, db.issues, db.costs, async () => {
            // Add properties (using bulkPut to allow updates if keys exist)
            await db.properties.bulkPut(INITIAL_PROPERTIES);

            // Add tenants
            await db.tenants.bulkPut(INITIAL_TENANTS);

            // Add documents
            await db.documents.bulkPut(INITIAL_DOCUMENTS);

            // Add issues
            await db.issues.bulkPut(INITIAL_ISSUES);

            // Add costs
            await db.costs.bulkPut(INITIAL_COSTS);
        });

        return { success: true, alreadySeeded: false };

    } catch (error) {
        console.error('❌ Database migration failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Clears all data from the database (useful for development/testing)
 */
export async function clearDatabase() {
    try {
        await db.transaction('rw', db.properties, db.tenants, db.documents, db.issues, db.costs, async () => {
            await db.properties.clear();
            await db.tenants.clear();
            await db.documents.clear();
            await db.issues.clear();
            await db.costs.clear();
        });
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to clear database:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Resets the database by clearing and re-seeding
 */
export async function resetDatabase() {
    await clearDatabase();
    return await seedDatabase();
}

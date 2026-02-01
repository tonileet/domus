const API_BASE_URL = 'http://localhost:3001/api';

async function cleanup() {
    console.log('🧹 Starting cleanup of test data...');

    try {
        // Fetch all properties
        const response = await fetch(`${API_BASE_URL}/properties`);
        if (!response.ok) {
            throw new Error(`Failed to fetch properties: ${response.statusText}`);
        }
        const properties = await response.json();

        // Identify test properties
        const testProperties = properties.filter(p =>
            p.name.includes('Test Apartment') ||
            p.name.includes('Updated Test Apartment')
        );

        console.log(`🔍 Found ${testProperties.length} test properties to delete.`);

        for (const prop of testProperties) {
            console.log(`🗑️ Deleting property: ${prop.name} (ID: ${prop.id})`);
            const deleteRes = await fetch(`${API_BASE_URL}/properties/${prop.id}`, {
                method: 'DELETE'
            });
            if (!deleteRes.ok) {
                console.error(`❌ Failed to delete ${prop.id}: ${deleteRes.statusText}`);
            }
        }

        console.log('✅ Cleanup completed successfully.');
    } catch (error) {
        console.error('❌ Error during cleanup:', error.message);
    }
}

cleanup();

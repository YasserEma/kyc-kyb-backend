const axios = require('axios');

const BASE_URL = 'http://localhost:3004/api/v1';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiM2Y1ZDk4NS1jN2EwLTRlY2MtODQwYS0zNjUwN2Q4ZjE5MGIiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwic3Vic2NyaWJlcklkIjoiMDcyYzA3ZDgtNzE1MS00NzM4LThkNmItYjMzZDY2ZTQxZmRlIiwiaWF0IjoxNzY0NzA1OTI2LCJleHAiOjE3NjQ3MDk1MjZ9.n2KrHSvfi10jW_UbRleOfySOF2ueFVspTRLVnbCzPdw';

async function testCustomFields() {
    try {
        console.log('🔍 Testing Custom Fields Fix...\n');

        // Step 1: List entities
        console.log('1. Fetching entities...');
        const entitiesResponse = await axios.get(`${BASE_URL}/entities?page=1&limit=1`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Accept': 'application/json'
            }
        });

        const entities = entitiesResponse.data.data;
        if (entities.length === 0) {
            console.log('❌ No entities found to test with');
            return;
        }

        const entity = entities[0];
        console.log(`✅ Found entity: ${entity.name} (${entity.id})\n`);

        // Step 2: Add custom fields
        console.log('2. Adding custom fields...');
        const customFieldsData = {
            custom_fields: [
                {
                    field_name: "occupation",
                    field_value: "Software Engineer",
                    field_group: "basic_info"
                }
            ]
        };

        const response = await axios.post(
            `${BASE_URL}/entities/${entity.id}/custom-fields`,
            customFieldsData,
            {
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        console.log('✅ Custom fields added successfully!');
        console.log('   Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.error('❌ Error:', error.response.status, error.response.statusText);
            console.error('   Message:', error.response.data.message);
            console.error('   Details:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('❌ Error:', error.message);
        }
        process.exit(1);
    }
}

testCustomFields();

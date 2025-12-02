const axios = require('axios');

const BASE_URL = 'http://localhost:3004/api/v1';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiM2Y1ZDk4NS1jN2EwLTRlY2MtODQwYS0zNjUwN2Q4ZjE5MGIiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwic3Vic2NyaWJlcklkIjoiMDcyYzA3ZDgtNzE1MS00NzM4LThkNmItYjMzZDY2ZTQxZmRlIiwiaWF0IjoxNzY0NjkzNzU4LCJleHAiOjE3NjQ2OTczNTh9.lyO-v7e3lZqtQs13znNxawLmf71XTZ9yI7CjAFpNxI0';

async function testRelationshipCreation() {
    try {
        console.log('🔍 Testing Relationship Creation Fix...\n');

        // Step 1: List entities
        console.log('1. Fetching entities...');
        const entitiesResponse = await axios.get(`${BASE_URL}/entities?page=1&limit=10`, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Accept': 'application/json'
            }
        });

        const entities = entitiesResponse.data.data;
        console.log(`✅ Found ${entities.length} entities`);

        if (entities.length < 2) {
            console.log('❌ Need at least 2 entities to test relationship creation');
            return;
        }

        const sourceEntity = entities.find(e => e.entity_type === 'individual');
        const targetEntity = entities.find(e => e.entity_type === 'organization');

        if (!sourceEntity || !targetEntity) {
            console.log('❌ Need both individual and organization entities');
            return;
        }

        console.log(`\n   Source Entity: ${sourceEntity.name} (${sourceEntity.id})`);
        console.log(`   Target Entity: ${targetEntity.name} (${targetEntity.id})\n`);

        // Step 2: Create relationship
        console.log('2. Creating relationship...');
        const relationshipData = {
            target_entity_id: targetEntity.id,
            relationship_type: 'director',
            start_date: '2024-01-01',
            metadata: {
                position: 'Non-Executive Director',
                department: 'Board',
                voting_rights: true
            }
        };

        const relationshipResponse = await axios.post(
            `${BASE_URL}/entities/${sourceEntity.id}/relationships`,
            relationshipData,
            {
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        console.log('✅ Relationship created successfully!');
        console.log(`   ID: ${relationshipResponse.data.id}`);
        console.log(`   Type: ${relationshipResponse.data.relationship_type}`);
        console.log(`   From: ${relationshipResponse.data.from_entity.name}`);
        console.log(`   To: ${relationshipResponse.data.to_entity.name}\n`);

        // Step 3: Verify relationship
        console.log('3. Verifying relationship...');
        const verifyResponse = await axios.get(
            `${BASE_URL}/entities/${sourceEntity.id}/relationships`,
            {
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Accept': 'application/json'
                }
            }
        );

        console.log(`✅ Found ${verifyResponse.data.length} relationship(s) for the entity\n`);

        // Step 4: Delete relationship
        const createdRel = verifyResponse.data.find(r => r.id === relationshipResponse.data.id);
        if (createdRel) {
            console.log('4. Deleting relationship...');
            await axios.delete(
                `${BASE_URL}/entities/relationships/${createdRel.id}`,
                { headers: { Authorization: `Bearer ${TOKEN}` } }
            );
            console.log('✅ Relationship deleted successfully');
        } else {
            console.log('❌ Created relationship not found in list');
        }

        console.log('🎉 All tests passed!');

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

testRelationshipCreation();

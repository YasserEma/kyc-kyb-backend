import { DataSource } from 'typeorm';

export async function seedEntityHistory(dataSource: DataSource): Promise<void> {
  console.log('🔄 Seeding entity history...');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // Check if entity history already exists
    const existingHistory = await queryRunner.query('SELECT COUNT(*) as count FROM entity_history');
    if (parseInt(existingHistory[0].count) > 0) {
      console.log('📋 Entity history already exists, skipping seeding');
      return;
    }

    // Get existing entities and users
    const entities = await queryRunner.query('SELECT id, name, status, entity_type FROM entities');
    const users = await queryRunner.query('SELECT id FROM subscriber_users');

    if (entities.length === 0 || users.length === 0) {
      console.log('⚠️ No entities or users found, skipping entity history seeding');
      return;
    }

    const changeTypes = ['CREATE', 'UPDATE', 'STATUS_CHANGE'];
    const ipAddresses = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.45', '198.51.100.78'];
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    ];

    const historyEntries = [];
    const now = new Date();

    // Create history for each entity
    for (const entity of entities) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      // 1. CREATE event (when entity was first created)
      const createDate = new Date(now.getTime() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000); // Within last 90 days
      
      historyEntries.push({
        id: 'gen_random_uuid()',
        entity_id: entity.id,
        changed_at: createDate.toISOString(),
        changed_by: randomUser.id,
        change_type: 'CREATE',
        old_values: JSON.stringify([
          {
            field: 'entity_type',
            old_value: null,
            new_value: entity.entity_type,
            change_reason: 'Initial entity creation'
          },
          {
            field: 'name',
            old_value: null,
            new_value: entity.name,
            change_reason: 'Initial entity creation'
          },
          {
            field: 'status',
            old_value: null,
            new_value: 'PENDING',
            change_reason: 'Initial entity creation'
          }
        ]),
        change_description: `Entity created: ${entity.name}`,
        ip_address: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
        user_agent: userAgents[Math.floor(Math.random() * userAgents.length)]
      });

      // 2. Generate 1-5 UPDATE events for each entity
      const numUpdates = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < numUpdates; i++) {
        const updateDate = new Date(createDate.getTime() + Math.floor(Math.random() * (now.getTime() - createDate.getTime())));
        const updateUser = users[Math.floor(Math.random() * users.length)];
        
        // Generate realistic field changes
        const possibleChanges = [
          {
            field: 'name',
            old_value: entity.name,
            new_value: entity.name + ' (Updated)',
            change_reason: 'Name correction requested by client'
          },
          {
            field: 'address',
            old_value: '123 Old Street, City',
            new_value: '456 New Avenue, City',
            change_reason: 'Address change notification received'
          },
          {
            field: 'contact_email',
            old_value: 'old@example.com',
            new_value: 'new@example.com',
            change_reason: 'Email update requested'
          },
          {
            field: 'risk_level',
            old_value: 'LOW',
            new_value: ['MEDIUM', 'HIGH'][Math.floor(Math.random() * 2)],
            change_reason: 'Risk assessment update'
          }
        ];

        const selectedChanges = possibleChanges.slice(0, Math.floor(Math.random() * 3) + 1);
        
        historyEntries.push({
          id: 'gen_random_uuid()',
          entity_id: entity.id,
          changed_at: updateDate.toISOString(),
          changed_by: updateUser.id,
          change_type: 'UPDATE',
          old_values: JSON.stringify(selectedChanges),
          change_description: `Entity information updated: ${selectedChanges.map(c => c.field).join(', ')}`,
          ip_address: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
          user_agent: userAgents[Math.floor(Math.random() * userAgents.length)]
        });
      }

      // 3. Possibly add a STATUS_CHANGE event
      if (Math.random() > 0.3) { // 70% chance of status change
        const statusChangeDate = new Date(createDate.getTime() + Math.floor(Math.random() * (now.getTime() - createDate.getTime())));
        const statusUser = users[Math.floor(Math.random() * users.length)];
        
        const statusChanges = [
          { from: 'PENDING', to: 'ACTIVE', reason: 'KYC verification completed' },
          { from: 'ACTIVE', to: 'INACTIVE', reason: 'Account temporarily suspended' },
          { from: 'INACTIVE', to: 'ACTIVE', reason: 'Account reactivated after review' },
          { from: 'ACTIVE', to: 'BLOCKED', reason: 'Suspicious activity detected' }
        ];
        
        const statusChange = statusChanges[Math.floor(Math.random() * statusChanges.length)];
        
        historyEntries.push({
          id: 'gen_random_uuid()',
          entity_id: entity.id,
          changed_at: statusChangeDate.toISOString(),
          changed_by: statusUser.id,
          change_type: 'STATUS_CHANGE',
          old_values: JSON.stringify([
            {
              field: 'status',
              old_value: statusChange.from,
              new_value: statusChange.to,
              change_reason: statusChange.reason
            }
          ]),
          change_description: `Status changed from ${statusChange.from} to ${statusChange.to}: ${statusChange.reason}`,
          ip_address: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
          user_agent: userAgents[Math.floor(Math.random() * userAgents.length)]
        });
      }
    }

    // Insert history entries in batches
    const batchSize = 50;
    for (let i = 0; i < historyEntries.length; i += batchSize) {
      const batch = historyEntries.slice(i, i + batchSize);
      const values = batch.map(entry => 
        `(gen_random_uuid(), '${entry.entity_id}', '${entry.changed_at}', '${entry.changed_by}', '${entry.change_type}', '${entry.old_values.replace(/'/g, "''")}', '${entry.change_description.replace(/'/g, "''")}', '${entry.ip_address}', '${entry.user_agent.replace(/'/g, "''")}')`
      ).join(', ');

      await queryRunner.query(`
        INSERT INTO entity_history (id, entity_id, changed_at, changed_by, change_type, old_values, change_description, ip_address, user_agent)
        VALUES ${values}
      `);
    }

    console.log(`✅ Successfully seeded ${historyEntries.length} entity history entries`);

  } catch (error) {
    console.error('❌ Error seeding entity history:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
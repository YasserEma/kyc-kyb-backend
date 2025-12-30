import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { NATIONALITIES } from '../../modules/lookups/data/nationalities.data';

/**
 * Seeder to migrate static nationalities data to the database for all subscribers.
 * This creates a "Nationalities" list (type: 'custom') for each subscriber
 * and populates it with all values from the NATIONALITIES array.
 * 
 * Mapping:
 * - NATIONALITIES.label → ListValue.value (e.g., "Saudi Arabia")
 * - NATIONALITIES.value → ListValue.normalized_value (e.g., "SA")
 */
export async function seedLookupMigration(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    // Get all subscribers
    const subscribers = await queryRunner.query('SELECT id FROM subscribers');
    
    if (!subscribers || subscribers.length === 0) {
      console.log('No subscribers found, skipping lookup migration seeding');
      return;
    }

    console.log(`Processing lookup migration for ${subscribers.length} subscribers...`);
    
    let listsCreated = 0;
    let valuesCreated = 0;

    for (const subscriber of subscribers) {
      const subscriberId = subscriber.id;

      // Check if Nationalities list already exists for this subscriber
      const existingList = await queryRunner.query(
        `SELECT id FROM lists_management 
         WHERE subscriber_id = $1 AND list_name = $2`,
        [subscriberId, 'Nationalities']
      );

      if (existingList && existingList.length > 0) {
        console.log(`Nationalities list already exists for subscriber ${subscriberId}, skipping...`);
        continue;
      }

      // Create the Nationalities list
      const listId = uuidv4();
      await queryRunner.query(
        `INSERT INTO lists_management (
          id, 
          subscriber_id, 
          list_name, 
          list_type, 
          description, 
          category, 
          status, 
          is_active,
          is_system_list,
          is_readonly
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          listId,
          subscriberId,
          'Nationalities',
          'custom',
          'ISO 3166-1 Alpha-2 Country Codes - Complete list of countries with codes and names',
          'regulatory',
          'active',
          true,
          true,  // Mark as system list
          false, // Allow editing
        ]
      );

      listsCreated++;
      console.log(`Created Nationalities list for subscriber ${subscriberId}`);

      // Insert all nationality values
      for (const nationality of NATIONALITIES) {
        const valueId = uuidv4();
        await queryRunner.query(
          `INSERT INTO list_values (
            id,
            list_id,
            value,
            value_type,
            normalized_value,
            status,
            is_active,
            is_verified,
            category,
            metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            valueId,
            listId,
            nationality.label,        // Display name (e.g., "Saudi Arabia")
            'custom',
            nationality.value,        // ISO code (e.g., "SA")
            'active',
            true,
            true,                     // Pre-verified data
            'nationality',
            JSON.stringify({ iso_code: nationality.value }),
          ]
        );
        valuesCreated++;
      }

      console.log(`Inserted ${NATIONALITIES.length} nationality values for subscriber ${subscriberId}`);
    }

    console.log(`Lookup migration complete: ${listsCreated} lists created, ${valuesCreated} values inserted`);
  } catch (error) {
    console.error('Error during lookup migration seeding:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

import 'dotenv/config';
import { AppDataSource } from '../config/data-source';
import { seedSystemLookups } from './seeders/20-system-lookups.seeder';

async function runSystemLookups() {
  await AppDataSource.initialize();
  try {
    await seedSystemLookups(AppDataSource);
    
    const lists = await AppDataSource.query('SELECT COUNT(*) FROM lists_management');
    const values = await AppDataSource.query('SELECT COUNT(*) FROM list_values');
    console.log('');
    console.log('Final counts:');
    console.log('  lists_management:', lists[0].count);
    console.log('  list_values:', values[0].count);
  } catch (err) {
    const error = err as Error;
    console.error('Error:', error.message);
  } finally {
    await AppDataSource.destroy();
  }
}

runSystemLookups();

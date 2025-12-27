import 'dotenv/config';
import { AppDataSource } from '../config/data-source';

async function resetLists() {
  await AppDataSource.initialize();
  try {
    console.log('🗑️ Clearing lists tables...');
    await AppDataSource.query('TRUNCATE TABLE list_values CASCADE');
    await AppDataSource.query('TRUNCATE TABLE lists_management CASCADE');
    console.log('✅ Lists tables cleared successfully');
    
    const check = await AppDataSource.query('SELECT COUNT(*) FROM lists_management');
    console.log('lists_management count:', check[0].count);
  } catch (err) {
    const error = err as Error;
    console.error('Error:', error.message);
  } finally {
    await AppDataSource.destroy();
  }
}

resetLists();

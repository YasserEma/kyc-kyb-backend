import { DataSource } from 'typeorm';
import { IndividualEntity } from '../../modules/entities/entities/individual-entity.entity';

export async function seedIndividualEntities(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(IndividualEntity);

  // Check if individual entities already exist
  const existingCount = await repository.count();
  if (existingCount > 0) {
    console.log('Individual entities already seeded, skipping...');
    return;
  }

  const individualEntitiesData: Partial<IndividualEntity>[] = [
    {
      entity_id: '550e8400-e29b-41d4-a716-446655440001',
      date_of_birth: new Date('1985-03-15'),
      nationality: ['US'],
      country_of_residence: ['US'],
      gender: 'male',
      address: '123 Main Street, New York, NY 10001, USA',
      occupation: 'Software Engineer',
      source_of_income: 'Employment - Technology Sector',
      is_pep: false,
      has_criminal_record: false,
      pep_details: undefined,
      criminal_record_details: undefined,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-01'),
      is_active: true
    },
    {
      entity_id: '550e8400-e29b-41d4-a716-446655440002',
      date_of_birth: new Date('1978-07-22'),
      nationality: ['GB'],
      country_of_residence: ['GB'],
      gender: 'female',
      address: '45 Baker Street, London, W1U 6TW, United Kingdom',
      occupation: 'Financial Analyst',
      source_of_income: 'Employment - Financial Services',
      is_pep: false,
      has_criminal_record: false,
      pep_details: undefined,
      criminal_record_details: undefined,
      created_at: new Date('2024-01-05'),
      updated_at: new Date('2024-01-05'),
      is_active: true
    },
    {
      entity_id: '550e8400-e29b-41d4-a716-446655440003',
      date_of_birth: new Date('1965-11-08'),
      nationality: ['FR'],
      country_of_residence: ['FR'],
      gender: 'male',
      address: '12 Rue de la Paix, 75001 Paris, France',
      occupation: 'Government Official',
      source_of_income: 'Government Salary',
      is_pep: true,
      has_criminal_record: false,
      pep_details: 'Deputy Minister of Finance, France (2018-present)',
      criminal_record_details: undefined,
      created_at: new Date('2024-02-01'),
      updated_at: new Date('2024-02-01'),
      is_active: true
    },
    {
      entity_id: '550e8400-e29b-41d4-a716-446655440004',
      date_of_birth: new Date('1972-09-14'),
      nationality: ['RU'],
      country_of_residence: ['CH'],
      gender: 'male',
      address: 'Bahnhofstrasse 45, 8001 Zurich, Switzerland',
      occupation: 'Business Owner',
      source_of_income: 'Business Income - Import/Export',
      is_pep: true,
      has_criminal_record: true,
      pep_details: 'Former Regional Governor, Russia (2010-2015)',
      criminal_record_details: 'Tax evasion charges (resolved 2020)',
      created_at: new Date('2024-01-15'),
      updated_at: new Date('2024-01-15'),
      is_active: true
    },
    {
      entity_id: '550e8400-e29b-41d4-a716-446655440005',
      date_of_birth: new Date('1988-05-20'),
      nationality: ['AU'],
      country_of_residence: ['AU'],
      gender: 'male',
      address: '456 Collins Street, Melbourne, VIC 3000, Australia',
      occupation: 'Investment Banker',
      source_of_income: 'Employment - Investment Banking',
      is_pep: false,
      has_criminal_record: false,
      pep_details: undefined,
      criminal_record_details: undefined,
      created_at: new Date('2023-06-01'),
      updated_at: new Date('2024-01-15'),
      is_active: false
    }
  ];

  try {
    await repository.save(individualEntitiesData);
    console.log(`Successfully seeded ${individualEntitiesData.length} individual entities`);
  } catch (error) {
    console.error('Error seeding individual entities:', error);
    throw error;
  }
}
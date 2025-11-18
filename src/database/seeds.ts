import 'dotenv/config';
import { AppDataSource } from '../config/data-source';
import { seedSubscribers } from './seeders/01-subscriber.seeder';
import { seedSubscriberUsers } from './seeders/02-subscriber-users.seeder';
import { seedRiskAnalysis } from './seeders/03-risk-analysis.seeder';
import { seedScreeningConfiguration } from './seeders/03-screening-configuration.seeder';
import { seedListsManagement } from './seeders/04-lists-management.seeder';
import { seedListValues } from './seeders/05-list-values.seeder';
import { seedScreeningConfigValues } from './seeders/06-screening-config-values.seeder';
import { seedRiskConfiguration } from './seeders/07-risk-configuration.seeder';
import { seedEntities } from './seeders/08-entities.seeder';
import { seedIndividualEntities } from './seeders/09-individual-entities.seeder';
import { seedOrganizationEntities } from './seeders/10-organization-entities.seeder';
import { seedLogs } from './seeders/11-logs.seeder';
import { seedEntityHistory } from './seeders/12-entity-history.seeder';
import { seedEntityCustomFields } from './seeders/13-entity-custom-fields.seeder';
import { seedIndividualRelationships } from './seeders/14-individual-relationships.seeder';
import { seedOrganizationRelationships } from './seeders/15-organization-relationships.seeder';
import { seedOrganizationAssociations } from './seeders/16-organization-associations.seeder';
import { seedDocuments } from './seeders/17-documents.seeder';
import { seedScreeningAnalysis } from './seeders/18-screening-analysis.seeder';
import { seedWizardTestingData } from './seeders/19-wizard-testing.seeder';

async function runSeeds() {
  await AppDataSource.initialize();
  try {
    console.log('🌱 Starting comprehensive database seeding...');
    
    // Core foundation tables
    console.log('Seeding: subscribers');
    await seedSubscribers(AppDataSource);
    console.log('Seeding: subscriber users');
    await seedSubscriberUsers(AppDataSource);
    
    // Configuration tables
    console.log('Seeding: screening configuration');
    await seedScreeningConfiguration(AppDataSource);
    console.log('Seeding: risk configuration');
    await seedRiskConfiguration(AppDataSource);
    console.log('Seeding: lists management');
    await seedListsManagement(AppDataSource);
    console.log('Seeding: list values');
    await seedListValues(AppDataSource);
    console.log('Seeding: screening config values');
    await seedScreeningConfigValues(AppDataSource);
    
    // Entity tables (core entities first)
    console.log('Seeding: entities');
    await seedEntities(AppDataSource);
    console.log('Seeding: individual entities');
    await seedIndividualEntities(AppDataSource);
    console.log('Seeding: organization entities');
    await seedOrganizationEntities(AppDataSource);
    
    // Entity-dependent tables
    console.log('Seeding: entity custom fields');
    await seedEntityCustomFields(AppDataSource);
    console.log('Seeding: entity history');
    await seedEntityHistory(AppDataSource);
    console.log('Seeding: documents');
    await seedDocuments(AppDataSource);
    
    // Relationship tables (require entities to exist)
    console.log('Seeding: individual relationships');
    await seedIndividualRelationships(AppDataSource);
    console.log('Seeding: organization relationships');
    await seedOrganizationRelationships(AppDataSource);
    console.log('Seeding: organization associations');
    await seedOrganizationAssociations(AppDataSource);
    
    // Analysis tables (require entities and configurations)
    console.log('Seeding: risk analysis');
    await seedRiskAnalysis(AppDataSource);
    console.log('Seeding: screening analysis');
    await seedScreeningAnalysis(AppDataSource);
    
    // System logs (can reference any table)
    console.log('Seeding: logs');
    await seedLogs(AppDataSource);
    
    // Wizard testing data
    console.log('Seeding: wizard testing data');
    await seedWizardTestingData(AppDataSource);
    
    console.log('✅ Comprehensive seeding completed successfully!');
    console.log('📊 All tables have been populated with realistic test data');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await AppDataSource.destroy();
  }
}

runSeeds();
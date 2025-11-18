import { DataSource } from 'typeorm';
import { EntityEntity } from '../../modules/entities/entities/entity.entity';
import { IndividualEntity } from '../../modules/entities/entities/individual-entity.entity';
import { OrganizationEntity } from '../../modules/entities/entities/organization-entity.entity';
import { DocumentEntity } from '../../modules/documents/entities/document.entity';
import { IndividualEntityRelationshipEntity } from '../../modules/individual-entity-relationships/entities/individual-entity-relationship.entity';
import { OrganizationRelationshipEntity } from '../../modules/organization-relationships/entities/organization-relationship.entity';
import { OrganizationEntityAssociationEntity } from '../../modules/organization-entity-associations/entities/organization-entity-association.entity';

export async function seedWizardTestingData(dataSource: DataSource): Promise<void> {
  console.log('🧙‍♂️ Starting wizard testing data seed...');

  // Check if wizard testing data already exists
  const entityRepo = dataSource.getRepository(EntityEntity);
  const wizardEntities = await entityRepo.find({ 
    where: { reference_number: 'WIZARD-TEST-001' } 
  });
  
  if (wizardEntities.length > 0) {
    console.log('Wizard testing data already seeded, skipping...');
    return;
  }

  // Create comprehensive wizard testing scenarios
  await createWizardTestScenario1(dataSource);
  await createWizardTestScenario2(dataSource);
  await createWizardTestScenario3(dataSource);
  
  console.log('✅ Wizard testing data seed completed!');
}

async function createWizardTestScenario1(dataSource: DataSource): Promise<void> {
  console.log('Creating Wizard Test Scenario 1: Complete Individual Entity...');
  
  const entityRepo = dataSource.getRepository(EntityEntity);
  const individualRepo = dataSource.getRepository(IndividualEntity);
  const documentRepo = dataSource.getRepository(DocumentEntity);

  // Create main individual entity
  const mainEntity = await entityRepo.save({
    id: '660e8400-e29b-41d4-a716-446655440001',
    subscriber_id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Wizard Test Individual',
    reference_number: 'WIZARD-TEST-001',
    entity_type: 'individual',
    status: 'active',
    created_by: '550e8400-e29b-41d4-a716-446655440001',
    onboarding_completed: true,
    risk_level: 'medium',
    screening_status: 'completed',
    last_screened_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    is_active: true
  });

  // Create individual details
  await individualRepo.save({
    entity_id: mainEntity.id,
    date_of_birth: new Date('1985-06-15'),
    nationality: ['US'],
    gender: 'male',
    occupation: 'Software Engineer',
    source_of_income: 'Employment salary',
    is_pep: false,
    has_criminal_record: false
  });

  // Create custom fields using raw SQL since EntityCustomField entity doesn't exist
  const customFields = [
    {
      entity_id: mainEntity.id,
      field_key: 'preferred_contact_method',
      field_value: 'email',
      field_type: 'TEXT',
      field_category: 'PERSONAL_INFO',
      is_sensitive: false,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      entity_id: mainEntity.id,
      field_key: 'emergency_contact_name',
      field_value: 'Jane TestIndividual',
      field_type: 'TEXT',
      field_category: 'PERSONAL_INFO',
      is_sensitive: false,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      entity_id: mainEntity.id,
      field_key: 'emergency_contact_phone',
      field_value: '+1-555-0124',
      field_type: 'TEXT',
      field_category: 'PERSONAL_INFO',
      is_sensitive: false,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    // Financial Information Group
    {
      entity_id: mainEntity.id,
      field_key: 'annual_income_range',
      field_value: '75000-100000',
      field_type: 'TEXT',
      field_category: 'FINANCIAL_INFO',
      is_sensitive: true,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      entity_id: mainEntity.id,
      field_key: 'source_of_funds',
      field_value: 'employment_salary',
      field_type: 'TEXT',
      field_category: 'FINANCIAL_INFO',
      is_sensitive: false,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      entity_id: mainEntity.id,
      field_key: 'bank_account_type',
      field_value: 'checking_savings',
      field_type: 'TEXT',
      field_category: 'FINANCIAL_INFO',
      is_sensitive: false,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    // Compliance Information Group
    {
      entity_id: mainEntity.id,
      field_key: 'compliance_notes',
      field_value: 'Standard due diligence completed',
      field_type: 'TEXT',
      field_category: 'COMPLIANCE_INFO',
      is_sensitive: false,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      entity_id: mainEntity.id,
      field_key: 'kyc_level',
      field_value: 'level_2',
      field_type: 'TEXT',
      field_category: 'COMPLIANCE_INFO',
      is_sensitive: false,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    }
  ];

  // Insert custom fields using raw SQL
  for (const field of customFields) {
    await dataSource.query(`
      INSERT INTO entity_custom_fields (id, entity_id, field_key, field_value, field_type, field_category, is_sensitive, created_at, created_by, updated_at, updated_by)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), $7, NOW(), $7)
    `, [field.entity_id, field.field_key, field.field_value, field.field_type, field.field_category, field.is_sensitive, field.created_by]);
  }

  // Create documents
  const documents = [
    {
      entity_id: mainEntity.id,
      document_type: 'passport',
      file_name: 'Passport_Wizard_TestIndividual.pdf',
      file_path: '/documents/wizard-test/passport.pdf',
      file_hash: 'abc123def456',
      mime_type: 'application/pdf',
      status: 'verified',
      uploaded_by: '550e8400-e29b-41d4-a716-446655440001',
      uploaded_at: new Date(),
      verified_by: '550e8400-e29b-41d4-a716-446655440001',
      verified_at: new Date()
    },
    {
      entity_id: mainEntity.id,
      document_type: 'utility_bill',
      file_name: 'Utility_Bill_Wizard.pdf',
      file_path: '/documents/wizard-test/utility_bill.pdf',
      file_hash: 'def456ghi789',
      mime_type: 'application/pdf',
      status: 'verified',
      uploaded_by: '550e8400-e29b-41d4-a716-446655440001',
      uploaded_at: new Date(),
      verified_by: '550e8400-e29b-41d4-a716-446655440001',
      verified_at: new Date()
    },
    {
      entity_id: mainEntity.id,
      document_type: 'employment_letter',
      file_name: 'Employment_Letter_Wizard.pdf',
      file_path: '/documents/wizard-test/employment_letter.pdf',
      file_hash: 'ghi789jkl012',
      mime_type: 'application/pdf',
      status: 'verified',
      uploaded_by: '550e8400-e29b-41d4-a716-446655440001',
      uploaded_at: new Date(),
      verified_by: '550e8400-e29b-41d4-a716-446655440001',
      verified_at: new Date()
    }
  ];

  await documentRepo.save(documents);
}

async function createWizardTestScenario2(dataSource: DataSource): Promise<void> {
  console.log('Creating Wizard Test Scenario 2: Complete Organization Entity...');
  
  const entityRepo = dataSource.getRepository(EntityEntity);
  const orgRepo = dataSource.getRepository(OrganizationEntity);
  const documentRepo = dataSource.getRepository(DocumentEntity);

  // Create main organization entity
  const mainEntity = await entityRepo.save({
    id: '660e8400-e29b-41d4-a716-446655440003',
    subscriber_id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Wizard Test Organization',
    reference_number: 'WIZARD-TEST-002',
    entity_type: 'organization',
    status: 'active',
    created_by: '550e8400-e29b-41d4-a716-446655440001',
    onboarding_completed: true,
    risk_level: 'medium',
    screening_status: 'completed',
    last_screened_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    is_active: true
  });

  // Create organization details
  await orgRepo.save({
    id: '660e8400-e29b-41d4-a716-446655440004',
    entity_id: mainEntity.id,
    legal_name: 'Wizard Test Organization Inc.',
    trading_name: 'Wizard Tech',
    registration_number: 'REG-2024-WIZ-001',
    tax_identification_number: 'TAX-123456789',
    incorporation_country: 'US',
    incorporation_date: new Date('2010-03-15'),
    business_type: 'corporation',
    industry_sector: 'technology',
    industry_code: '5112',
    website: 'https://wizardtech.example.com',
    email: 'contact@wizardtech.example.com',
    phone: '+1-555-0200',
    address_line_1: '456 Wizard Corporate Blvd',
    address_line_2: 'Floor 10',
    city: 'Magic City',
    state: 'CA',
    postal_code: '90210',
    country: 'US',
    registered_address_line_1: '456 Wizard Corporate Blvd',
    registered_address_line_2: 'Floor 10',
    registered_city: 'Magic City',
    registered_state: 'CA',
    registered_postal_code: '90210',
    registered_country: 'US',
    authorized_share_capital: 1000000,
    issued_share_capital: 750000,
    number_of_employees: 150,
    annual_turnover: 25000000,
    is_publicly_traded: false,
    is_pep_related: false,
    is_sanctions_related: false,
    risk_level: 'medium',
    screening_status: 'completed',
    last_screened_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    is_active: true
  });

  // Create custom fields for organization using raw SQL
  const customFields = [
    // Corporate Information Group
    {
      entity_id: mainEntity.id,
      field_key: 'board_members_count',
      field_value: '7',
      field_type: 'TEXT',
      field_category: 'CORPORATE_INFO',
      is_sensitive: false,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      entity_id: mainEntity.id,
      field_key: 'audit_firm',
      field_value: 'Big Four Accounting',
      field_type: 'TEXT',
      field_category: 'CORPORATE_INFO',
      is_sensitive: false,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      entity_id: mainEntity.id,
      field_key: 'legal_counsel',
      field_value: 'Magic City Law Firm',
      field_type: 'TEXT',
      field_category: 'CORPORATE_INFO',
      is_sensitive: false,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    // Financial Information Group
    {
      entity_id: mainEntity.id,
      field_key: 'primary_bank',
      field_value: 'National Bank of Magic City',
      field_type: 'TEXT',
      field_category: 'FINANCIAL_INFO',
      is_sensitive: true,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      entity_id: mainEntity.id,
      field_key: 'credit_rating',
      field_value: 'A+',
      field_type: 'TEXT',
      field_category: 'FINANCIAL_INFO',
      is_sensitive: false,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      entity_id: mainEntity.id,
      field_key: 'revenue_growth_rate',
      field_value: '15.5',
      field_type: 'TEXT',
      field_category: 'FINANCIAL_INFO',
      is_sensitive: false,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    // Compliance Information Group
    {
      entity_id: mainEntity.id,
      field_key: 'compliance_officer',
      field_value: 'John Compliance',
      field_type: 'TEXT',
      field_category: 'COMPLIANCE_INFO',
      is_sensitive: false,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      entity_id: mainEntity.id,
      field_key: 'aml_policy_version',
      field_value: 'v2.1',
      field_type: 'TEXT',
      field_category: 'COMPLIANCE_INFO',
      is_sensitive: false,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      entity_id: mainEntity.id,
      field_key: 'last_audit_date',
      field_value: '2024-01-15',
      field_type: 'TEXT',
      field_category: 'COMPLIANCE_INFO',
      is_sensitive: false,
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    }
  ];

  // Insert custom fields using raw SQL
  for (const field of customFields) {
    await dataSource.query(`
      INSERT INTO entity_custom_fields (id, entity_id, field_key, field_value, field_type, field_category, is_sensitive, created_at, created_by, updated_at, updated_by)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), $7, NOW(), $7)
    `, [field.entity_id, field.field_key, field.field_value, field.field_type, field.field_category, field.is_sensitive, field.created_by]);
  }

  // Create organization documents
  const documents = [
    {
      entity_id: mainEntity.id,
      document_type: 'certificate_of_incorporation',
      file_name: 'Certificate_of_Incorporation_Wizard.pdf',
      file_path: '/documents/wizard-test/certificate_of_incorporation.pdf',
      file_hash: 'mno345pqr678',
      mime_type: 'application/pdf',
      status: 'verified',
      uploaded_by: '550e8400-e29b-41d4-a716-446655440001',
      uploaded_at: new Date(),
      verified_by: '550e8400-e29b-41d4-a716-446655440001',
      verified_at: new Date()
    },
    {
      entity_id: mainEntity.id,
      document_type: 'tax_certificate',
      file_name: 'Tax_Certificate_Wizard.pdf',
      file_path: '/documents/wizard-test/tax_certificate.pdf',
      file_hash: 'pqr678stu901',
      mime_type: 'application/pdf',
      status: 'verified',
      uploaded_by: '550e8400-e29b-41d4-a716-446655440001',
      uploaded_at: new Date(),
      verified_by: '550e8400-e29b-41d4-a716-446655440001',
      verified_at: new Date()
    },
    {
      entity_id: mainEntity.id,
      document_type: 'board_resolution',
      file_name: 'Board_Resolution_Authorization.pdf',
      file_path: '/documents/wizard-test/board_resolution.pdf',
      file_hash: 'jkl012mno345',
      mime_type: 'application/pdf',
      status: 'verified',
      uploaded_by: '550e8400-e29b-41d4-a716-446655440001',
      uploaded_at: new Date(),
      verified_by: '550e8400-e29b-41d4-a716-446655440001',
      verified_at: new Date()
    }
  ];

  await documentRepo.save(documents);
}

async function createWizardTestScenario3(dataSource: DataSource): Promise<void> {
  console.log('Creating Wizard Test Scenario 3: Relationships and Associations...');
  
  const individualRelRepo = dataSource.getRepository(IndividualEntityRelationshipEntity);
  const orgRelRepo = dataSource.getRepository(OrganizationRelationshipEntity);
  const orgAssocRepo = dataSource.getRepository(OrganizationEntityAssociationEntity);

  // Create individual relationships
  const individualRelationships = [
    {
      primary_individual_id: '660e8400-e29b-41d4-a716-446655440002', // Wizard Test Individual
      related_individual_id: '550e8400-e29b-41d4-a716-446655440002', // Jane Doe
      relationship_type: 'family',
      relationship_description: 'Spouse relationship for wizard testing',
      relationship_status: 'active',
      effective_from: new Date('2015-06-15'),
      effective_to: undefined,
      relationship_start_date: new Date('2015-06-15'),
      relationship_end_date: undefined,
      verified: true,
      verified_by: '550e8400-e29b-41d4-a716-446655440001',
      verified_at: new Date(),
      verification_method: 'document_verification',
      is_verified: true,
      verification_status: 'verified',
      is_primary: true,
      is_reciprocal: true,
      is_pep_related: false,
      is_sanctions_related: false,
      requires_enhanced_due_diligence: false,
      risk_level: 'low',
      risk_factors: 'Family relationship, low risk',
      is_high_risk: false,
      needs_review: false,
      next_review_date: new Date('2025-06-15'),
      ownership_percentage: 0,
      legal_basis: 'Family connection',
      notes: 'Wizard test relationship - family connection',
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      primary_individual_id: '660e8400-e29b-41d4-a716-446655440002', // Wizard Test Individual
      related_individual_id: '550e8400-e29b-41d4-a716-446655440002', // Jane Doe
      relationship_type: 'business',
      relationship_description: 'Business partner relationship for wizard testing',
      relationship_status: 'active',
      effective_from: new Date('2022-06-01'),
      effective_to: undefined,
      relationship_start_date: new Date('2022-06-01'),
      relationship_end_date: undefined,
      verified: false,
      verified_by: undefined,
      verified_at: undefined,
      verification_method: undefined,
      is_verified: false,
      verification_status: 'pending',
      is_primary: true,
      is_reciprocal: false,
      is_pep_related: false,
      is_sanctions_related: false,
      requires_enhanced_due_diligence: true,
      risk_level: 'medium',
      risk_factors: 'Business relationship, requires enhanced due diligence',
      is_high_risk: false,
      needs_review: true,
      next_review_date: new Date('2024-12-01'),
      ownership_percentage: 25.5,
      legal_basis: 'Business partnership agreement',
      notes: 'Wizard test relationship - business partnership',
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    }
  ];

  await individualRelRepo.save(individualRelationships);

  // Create organization relationships
  const organizationRelationships = [
    {
      primary_organization_id: '550e8400-e29b-41d4-a716-446655440011', // Acme Corporation
      related_organization_id: '660e8400-e29b-41d4-a716-446655440003', // Wizard Test Organization
      relationship_type: 'subsidiary',
      relationship_description: 'Wizard Test Organization is a subsidiary of Acme Corporation',
      ownership_percentage: 75.0,
      effective_from: new Date('2020-01-01'),
      effective_to: undefined,
      verified: true,
      verified_by: '550e8400-e29b-41d4-a716-446655440001',
      verified_at: new Date(),
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      primary_organization_id: '660e8400-e29b-41d4-a716-446655440003', // Wizard Test Organization
      related_organization_id: '550e8400-e29b-41d4-a716-446655440012', // TechStart Inc.
      relationship_type: 'joint_venture',
      relationship_description: 'Joint venture partnership for technology development',
      ownership_percentage: 50.0,
      effective_from: new Date('2023-01-01'),
      effective_to: new Date('2025-12-31'),
      verified: true,
      verified_by: '550e8400-e29b-41d4-a716-446655440001',
      verified_at: new Date(),
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    }
  ];

  await orgRelRepo.save(organizationRelationships);

  // Create organization-entity associations
  const organizationAssociations = [
    {
      organization_id: '660e8400-e29b-41d4-a716-446655440003', // Wizard Test Organization
      individual_id: '660e8400-e29b-41d4-a716-446655440002', // Wizard Test Individual
      relationship_type: 'employee',
      ownership_percentage: 0,
      position_title: 'Senior Software Engineer',
      effective_from: new Date('2021-03-01'),
      effective_to: undefined,
      association_description: 'Senior engineer at Wizard Test Organization',
      verified: true,
      verified_by: '550e8400-e29b-41d4-a716-446655440001',
      verified_at: new Date(),
      risk_level: 'low',
      next_review_date: new Date('2025-03-01'),
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    },
    {
      organization_id: '660e8400-e29b-41d4-a716-446655440003', // Wizard Test Organization
      individual_id: '550e8400-e29b-41d4-a716-446655440001', // John Smith
      relationship_type: 'director',
      ownership_percentage: 15.0,
      position_title: 'Board Member and Technical Advisor',
      effective_from: new Date('2020-01-01'),
      effective_to: undefined,
      association_description: 'Board member with technical expertise',
      verified: true,
      verified_by: '550e8400-e29b-41d4-a716-446655440001',
      verified_at: new Date(),
      risk_level: 'medium',
      next_review_date: new Date('2024-12-01'),
      created_by: '550e8400-e29b-41d4-a716-446655440001'
    }
  ];

  await orgAssocRepo.save(organizationAssociations);
}

export async function clearWizardTestingData(dataSource: DataSource): Promise<void> {
  console.log('🧹 Clearing wizard testing data...');
  
  const entityRepo = dataSource.getRepository(EntityEntity);
  const individualRepo = dataSource.getRepository(IndividualEntity);
  const orgRepo = dataSource.getRepository(OrganizationEntity);
  const documentRepo = dataSource.getRepository(DocumentEntity);
  const individualRelRepo = dataSource.getRepository(IndividualEntityRelationshipEntity);
  const orgRelRepo = dataSource.getRepository(OrganizationRelationshipEntity);
  const orgAssocRepo = dataSource.getRepository(OrganizationEntityAssociationEntity);

  // Delete in reverse order to respect foreign key constraints
  await individualRelRepo.createQueryBuilder()
    .where('primary_individual_id IN (:...ids) OR related_individual_id IN (:...ids)', {
      ids: ['660e8400-e29b-41d4-a716-446655440002']
    })
    .delete()
    .execute();

  await orgRelRepo.createQueryBuilder()
    .where('primary_organization_id = :id OR related_organization_id = :id', {
      id: '660e8400-e29b-41d4-a716-446655440003'
    })
    .delete()
    .execute();

  await orgAssocRepo.createQueryBuilder()
    .where('organization_id = :orgId OR individual_id = :indId', {
      orgId: '660e8400-e29b-41d4-a716-446655440003',
      indId: '660e8400-e29b-41d4-a716-446655440002'
    })
    .delete()
    .execute();

  await documentRepo.createQueryBuilder()
    .where('entity_id IN (:...ids)', { 
      ids: ['660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003'] 
    })
    .delete()
    .execute();

  // Delete custom fields using raw SQL
  await dataSource.query(`
    DELETE FROM entity_custom_fields 
    WHERE entity_id IN ($1, $2)
  `, ['660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003']);

  await individualRepo.createQueryBuilder()
    .where('entity_id = :id', { id: '660e8400-e29b-41d4-a716-446655440001' })
    .delete()
    .execute();

  await orgRepo.createQueryBuilder()
    .where('entity_id = :id', { id: '660e8400-e29b-41d4-a716-446655440003' })
    .delete()
    .execute();

  await entityRepo.createQueryBuilder()
    .where('reference_number LIKE :ref', { ref: 'WIZARD-TEST-%' })
    .delete()
    .execute();

  console.log('✅ Wizard testing data cleared!');
}
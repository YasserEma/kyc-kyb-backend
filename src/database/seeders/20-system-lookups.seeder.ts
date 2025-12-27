import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { NATIONALITIES } from '../../modules/lookups/data/nationalities.data';

/**
 * Per-Subscriber System Lookups Seeder
 * 
 * COMPLETE TENANT ISOLATION:
 * Each subscriber gets their OWN copy of all system lists.
 * Values added by one subscriber are NOT visible to others.
 * 
 * Column Mapping:
 * - Source.value (Enum Key) → list_values.value
 * - Source.label (Display)  → list_values.normalized_value
 * - Source.description      → list_values.description
 */

interface LookupItem {
  value: string;
  label: string;
  description?: string;
}

interface LookupCategory {
  name: string;
  description: string;
  category: string;
  items: LookupItem[];
}

// ==================== SYSTEM DEFAULT LISTS ====================
// Each subscriber gets their own copy of these lists

const SYSTEM_LISTS: LookupCategory[] = [
  {
    name: 'Nationalities',
    description: 'ISO 3166-1 Alpha-2 Country Codes',
    category: 'regulatory',
    items: NATIONALITIES.map(n => ({ value: n.value, label: n.label })),
  },
  {
    name: 'Genders',
    description: 'Gender options for individual entities',
    category: 'demographic',
    items: [
      { value: 'MALE', label: 'Male' },
      { value: 'FEMALE', label: 'Female' },
      { value: 'OTHER', label: 'Other' },
      { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
    ],
  },
  {
    name: 'Document Types',
    description: 'Types of identity and verification documents',
    category: 'compliance',
    items: [
      { value: 'PASSPORT', label: 'Passport', description: 'International passport' },
      { value: 'NATIONAL_ID', label: 'National ID', description: 'National identity card' },
      { value: 'DRIVERS_LICENSE', label: 'Drivers License', description: 'Government-issued driving license' },
      { value: 'UTILITY_BILL', label: 'Utility Bill', description: 'Proof of address document' },
      { value: 'BANK_STATEMENT', label: 'Bank Statement', description: 'Financial statement' },
      { value: 'ARTICLES_OF_INCORPORATION', label: 'Articles of Incorporation', description: 'Company registration document' },
      { value: 'TAX_CERTIFICATE', label: 'Tax Certificate', description: 'Tax registration certificate' },
      { value: 'COMMERCIAL_LICENSE', label: 'Commercial License', description: 'Business operating license' },
      { value: 'PROOF_OF_ADDRESS', label: 'Proof of Address', description: 'Address verification document' },
      { value: 'OTHER', label: 'Other', description: 'Other document type' },
    ],
  },
  {
    name: 'Organization Types',
    description: 'Types of business organizations',
    category: 'compliance',
    items: [
      { value: 'CORPORATION', label: 'Corporation', description: 'Limited liability company' },
      { value: 'LLC', label: 'LLC', description: 'Limited Liability Company' },
      { value: 'PARTNERSHIP', label: 'Partnership', description: 'Business partnership' },
      { value: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietorship', description: 'Individual-owned business' },
      { value: 'NGO', label: 'NGO', description: 'Non-Governmental Organization' },
      { value: 'TRUST', label: 'Trust', description: 'Legal trust arrangement' },
      { value: 'FOUNDATION', label: 'Foundation', description: 'Charitable foundation' },
      { value: 'GOVERNMENT', label: 'Government', description: 'Government entity' },
      { value: 'OTHER', label: 'Other', description: 'Other organization type' },
    ],
  },
  {
    name: 'Individual Relationship Types',
    description: 'Relationship types between individuals',
    category: 'relationships',
    items: [
      { value: 'SPOUSE', label: 'Spouse', description: 'Married partner' },
      { value: 'CHILD', label: 'Child', description: 'Son or daughter' },
      { value: 'PARENT', label: 'Parent', description: 'Mother or father' },
      { value: 'SIBLING', label: 'Sibling', description: 'Brother or sister' },
      { value: 'RELATIVE', label: 'Relative', description: 'Other family member' },
      { value: 'BUSINESS_PARTNER', label: 'Business Partner', description: 'Joint business interest' },
      { value: 'ASSOCIATE', label: 'Associate', description: 'Known associate' },
      { value: 'GUARDIAN', label: 'Guardian', description: 'Legal guardian' },
      { value: 'BENEFICIARY', label: 'Beneficiary', description: 'Named beneficiary' },
    ],
  },
  {
    name: 'Organization Relationship Types',
    description: 'Relationship types between organizations',
    category: 'relationships',
    items: [
      { value: 'PARENT', label: 'Parent Company', description: 'Parent organization' },
      { value: 'SUBSIDIARY', label: 'Subsidiary', description: 'Owned subsidiary' },
      { value: 'AFFILIATE', label: 'Affiliate', description: 'Affiliated organization' },
      { value: 'JOINT_VENTURE', label: 'Joint Venture', description: 'Joint venture partner' },
      { value: 'BRANCH', label: 'Branch', description: 'Regional branch office' },
      { value: 'SISTER_COMPANY', label: 'Sister Company', description: 'Related company' },
      { value: 'PARTNER', label: 'Partner', description: 'Business partner' },
    ],
  },
  {
    name: 'Association Types',
    description: 'Individual-to-Organization association types',
    category: 'relationships',
    items: [
      { value: 'UBO', label: 'Ultimate Beneficial Owner', description: 'Owns 25%+ of the organization' },
      { value: 'SHAREHOLDER', label: 'Shareholder', description: 'Holds shares in the organization' },
      { value: 'BENEFICIAL_OWNER', label: 'Beneficial Owner', description: 'Benefits from ownership' },
      { value: 'DIRECTOR', label: 'Director', description: 'Board director' },
      { value: 'CEO', label: 'CEO', description: 'Chief Executive Officer' },
      { value: 'CFO', label: 'CFO', description: 'Chief Financial Officer' },
      { value: 'COO', label: 'COO', description: 'Chief Operating Officer' },
      { value: 'MANAGER', label: 'Manager', description: 'Management position' },
      { value: 'BOARD_MEMBER', label: 'Board Member', description: 'Member of the board' },
      { value: 'SECRETARY', label: 'Secretary', description: 'Company secretary' },
      { value: 'TRUSTEE', label: 'Trustee', description: 'Trust trustee' },
      { value: 'SETTLOR', label: 'Settlor', description: 'Trust settlor' },
    ],
  },
  {
    name: 'Entity Types',
    description: 'Types of entities (KYC/KYB)',
    category: 'compliance',
    items: [
      { value: 'INDIVIDUAL', label: 'Individual', description: 'Natural person (KYC)' },
      { value: 'ORGANIZATION', label: 'Organization', description: 'Business entity (KYB)' },
    ],
  },
  {
    name: 'Entity Statuses',
    description: 'Workflow states for entities',
    category: 'workflow',
    items: [
      { value: 'PENDING', label: 'Pending', description: 'Awaiting review' },
      { value: 'ACTIVE', label: 'Active', description: 'Verified and active' },
      { value: 'INACTIVE', label: 'Inactive', description: 'Temporarily disabled' },
      { value: 'BLOCKED', label: 'Blocked', description: 'Access denied due to risk' },
      { value: 'ARCHIVED', label: 'Archived', description: 'Historical record' },
    ],
  },
  {
    name: 'Risk Levels',
    description: 'Risk classification levels',
    category: 'risk',
    items: [
      { value: 'LOW', label: 'Low', description: 'Minimal risk indicators' },
      { value: 'MEDIUM', label: 'Medium', description: 'Some risk factors present' },
      { value: 'HIGH', label: 'High', description: 'Significant risk indicators' },
      { value: 'CRITICAL', label: 'Critical', description: 'Severe risk - immediate action required' },
    ],
  },
  {
    name: 'Screening Statuses',
    description: 'Screening result statuses',
    category: 'screening',
    items: [
      { value: 'CLEAR', label: 'Clear', description: 'No matches found' },
      { value: 'MATCH', label: 'Match', description: 'Potential match found' },
      { value: 'PENDING_REVIEW', label: 'Pending Review', description: 'Awaiting manual review' },
      { value: 'APPROVED', label: 'Approved', description: 'Reviewed and approved' },
      { value: 'REJECTED', label: 'Rejected', description: 'Reviewed and rejected' },
    ],
  },
];

/**
 * Seeds default lists for a SINGLE subscriber
 * Called during seeding and when new subscribers register
 */
export async function seedDefaultListsForSubscriber(
  dataSource: DataSource,
  subscriberId: string,
  subscriberName: string = 'Unknown'
): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    for (const listDef of SYSTEM_LISTS) {
      // Check if this subscriber already has this list
      const existing = await queryRunner.query(
        `SELECT id FROM lists_management WHERE list_name = $1 AND subscriber_id = $2`,
        [listDef.name, subscriberId]
      );

      if (existing && existing.length > 0) {
        continue; // Skip if already exists
      }

      // Create the list for this subscriber
      const listId = uuidv4();
      await queryRunner.query(
        `INSERT INTO lists_management (
          id, subscriber_id, list_name, list_type, description, category,
          status, is_active, is_system_list, is_readonly
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          listId,
          subscriberId,
          listDef.name,
          'system_lookup',
          listDef.description,
          listDef.category,
          'active',
          true,
          true,   // is_system_list (seeded default)
          false,  // is_readonly = false (can be customized)
        ]
      );

      // Insert default values
      for (const item of listDef.items) {
        await queryRunner.query(
          `INSERT INTO list_values (
            id, list_id, value, value_type, normalized_value, 
            description, status, is_active, is_verified
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            uuidv4(),
            listId,
            item.value,
            'enum',
            item.label,
            item.description || null,
            'active',
            true,
            true,
          ]
        );
      }
    }

    console.log(`Created ${SYSTEM_LISTS.length} lists for "${subscriberName}"`);
  } finally {
    await queryRunner.release();
  }
}

/**
 * Main seeder: Seeds all lists for ALL existing subscribers
 * COMPLETE TENANT ISOLATION: Each subscriber gets their own copy
 */
export async function seedSystemLookups(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    console.log('Starting per-subscriber lookups seeding (TENANT ISOLATION)...');

    // Get all subscribers
    const subscribers = await queryRunner.query(
      'SELECT id, company_name FROM subscribers ORDER BY created_at ASC'
    );
    
    if (!subscribers || subscribers.length === 0) {
      console.log('No subscribers found, skipping system lookups seeding');
      return;
    }

    console.log(`Found ${subscribers.length} subscribers, seeding lists for each...`);

    // Seed lists for EACH subscriber
    for (const subscriber of subscribers) {
      await seedDefaultListsForSubscriber(
        dataSource,
        subscriber.id,
        subscriber.company_name || subscriber.id
      );
    }

    // Count results
    const listCount = await queryRunner.query('SELECT COUNT(*) FROM lists_management');
    const valueCount = await queryRunner.query('SELECT COUNT(*) FROM list_values');
    
    console.log(`\nFinal counts:`);
    console.log(`  lists_management: ${listCount[0].count}`);
    console.log(`  list_values: ${valueCount[0].count}`);
    console.log('\n✓ Per-subscriber lookups seeding complete');
  } catch (error) {
    console.error('Error during system lookups seeding:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

// Export for use in auth service when new subscribers register
export { SYSTEM_LISTS };

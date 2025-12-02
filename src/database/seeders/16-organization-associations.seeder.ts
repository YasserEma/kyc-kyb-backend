import { DataSource } from 'typeorm';

export async function seedOrganizationAssociations(dataSource: DataSource): Promise<void> {
  console.log('🔄 Seeding organization associations...');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // Check if the table exists (it was deprecated and removed in migration)
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'organization_associations'
      );
    `);

    if (!tableExists[0].exists) {
      console.log('ℹ️ Table "organization_associations" has been deprecated and replaced by "entity_relationships". Skipping seeding.');
      return;
    }

    // Check if associations already exist
    const existingAssociations = await queryRunner.query('SELECT COUNT(*) as count FROM organization_associations');
    if (parseInt(existingAssociations[0].count) > 0) {
      console.log('📋 Organization associations already exist, skipping seeding');
      return;
    }

    // Get existing organizations, individuals, and users
    const organizations = await queryRunner.query(`
      SELECT oe.id, e.name, oe.legal_name, oe.organization_type
      FROM organization_entities oe 
      JOIN entities e ON oe.entity_id = e.id 
      WHERE e.entity_type = 'ORGANIZATION'
    `);

    const individuals = await queryRunner.query(`
      SELECT ie.id, e.name
      FROM individual_entities ie 
      JOIN entities e ON ie.entity_id = e.id 
      WHERE e.entity_type = 'INDIVIDUAL'
    `);

    const users = await queryRunner.query('SELECT id FROM subscriber_users');

    if (organizations.length === 0 || individuals.length === 0 || users.length === 0) {
      console.log('⚠️ Need organizations, individuals, and users, skipping organization associations seeding');
      return;
    }

    // Define relationship types and their characteristics
    const relationshipTypes: Record<string, {
      category: string;
      hasOwnership: boolean;
      ownershipRange: number[];
      hasPosition: boolean;
      signingAuthority?: boolean;
    }> = {
      // Ownership types
      'UBO': { category: 'ownership', hasOwnership: true, ownershipRange: [25, 100], hasPosition: false },
      'SHAREHOLDER': { category: 'ownership', hasOwnership: true, ownershipRange: [1, 49], hasPosition: false },
      'BENEFICIAL_OWNER': { category: 'ownership', hasOwnership: true, ownershipRange: [10, 100], hasPosition: false },
      'TRUSTEE': { category: 'ownership', hasOwnership: false, ownershipRange: [0, 0], hasPosition: false },
      'SETTLOR': { category: 'ownership', hasOwnership: true, ownershipRange: [50, 100], hasPosition: false },

      // Management types
      'CEO': { category: 'management', hasOwnership: false, ownershipRange: [0, 25], hasPosition: true, signingAuthority: true },
      'CFO': { category: 'management', hasOwnership: false, ownershipRange: [0, 15], hasPosition: true, signingAuthority: true },
      'COO': { category: 'management', hasOwnership: false, ownershipRange: [0, 15], hasPosition: true, signingAuthority: true },
      'DIRECTOR': { category: 'management', hasOwnership: false, ownershipRange: [0, 20], hasPosition: true, signingAuthority: true },
      'MANAGER': { category: 'management', hasOwnership: false, ownershipRange: [0, 10], hasPosition: true, signingAuthority: false },
      'BOARD_MEMBER': { category: 'management', hasOwnership: false, ownershipRange: [0, 30], hasPosition: true, signingAuthority: false },
      'SECRETARY': { category: 'management', hasOwnership: false, ownershipRange: [0, 5], hasPosition: true, signingAuthority: true },
      'TREASURER': { category: 'management', hasOwnership: false, ownershipRange: [0, 10], hasPosition: true, signingAuthority: true },

      // Hybrid types
      'CEO_SHAREHOLDER': { category: 'hybrid', hasOwnership: true, ownershipRange: [15, 75], hasPosition: true, signingAuthority: true },
      'DIRECTOR_UBO': { category: 'hybrid', hasOwnership: true, ownershipRange: [25, 100], hasPosition: true, signingAuthority: true }
    };

    const ownershipTypes = ['DIRECT', 'INDIRECT', 'BENEFICIAL'];
    const positionTitles: Record<string, string[]> = {
      'CEO': ['Chief Executive Officer', 'President & CEO', 'Managing Director'],
      'CFO': ['Chief Financial Officer', 'Finance Director', 'VP Finance'],
      'COO': ['Chief Operating Officer', 'Operations Director', 'VP Operations'],
      'DIRECTOR': ['Board Director', 'Executive Director', 'Non-Executive Director'],
      'MANAGER': ['General Manager', 'Operations Manager', 'Business Manager'],
      'BOARD_MEMBER': ['Board Member', 'Board Representative', 'Independent Director'],
      'SECRETARY': ['Company Secretary', 'Corporate Secretary', 'Board Secretary'],
      'TREASURER': ['Company Treasurer', 'Chief Treasurer', 'Finance Manager'],
      'CEO_SHAREHOLDER': ['CEO & Founder', 'Managing Director & Owner'],
      'DIRECTOR_UBO': ['Director & Ultimate Beneficial Owner', 'Executive Director & Owner']
    };

    const associations = [];
    const now = new Date();

    // Generate associations for each organization
    for (const org of organizations) {
      // Each organization gets 2-8 associations
      const numAssociations = Math.floor(Math.random() * 7) + 2;
      const usedIndividuals = new Set(); // Avoid duplicate individuals for same org

      // Ensure each organization has at least one UBO and one management position
      const guaranteedTypes = ['UBO', 'CEO'];
      const selectedTypes = [...guaranteedTypes];

      // Add random additional types
      const availableTypes = Object.keys(relationshipTypes);
      for (let i = selectedTypes.length; i < numAssociations; i++) {
        const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        selectedTypes.push(randomType);
      }

      for (let i = 0; i < selectedTypes.length && i < numAssociations; i++) {
        // Select a unique individual for this organization
        let selectedIndividual;
        let attempts = 0;
        do {
          selectedIndividual = individuals[Math.floor(Math.random() * individuals.length)];
          attempts++;
        } while (usedIndividuals.has(selectedIndividual.id) && attempts < 20);

        if (usedIndividuals.has(selectedIndividual.id)) {
          continue; // Skip if we can't find a unique individual
        }
        usedIndividuals.add(selectedIndividual.id);

        const relationshipType = selectedTypes[i];
        const typeConfig = relationshipTypes[relationshipType];
        const randomUser = users[Math.floor(Math.random() * users.length)];

        // Calculate ownership percentage
        let ownershipPercentage = null;
        let ownershipType = null;
        if (typeConfig.hasOwnership && Math.random() > 0.1) { // 90% chance if type supports ownership
          const [minOwnership, maxOwnership] = typeConfig.ownershipRange;
          if (maxOwnership > 0) {
            ownershipPercentage = Math.floor(Math.random() * (maxOwnership - minOwnership + 1)) + minOwnership;
            ownershipType = ownershipTypes[Math.floor(Math.random() * ownershipTypes.length)];
          }
        }

        // Set position title
        let positionTitle = null;
        if (typeConfig.hasPosition) {
          const titles = positionTitles[relationshipType] || [relationshipType.replace(/_/g, ' ')];
          positionTitle = titles[Math.floor(Math.random() * titles.length)];
        }

        // Set signing authority
        const hasSigningAuthority = typeConfig.signingAuthority && Math.random() > 0.2; // 80% chance if type supports it

        // Generate dates
        const startDate = new Date(now.getTime() - Math.floor(Math.random() * 365 * 8) * 24 * 60 * 60 * 1000); // Up to 8 years ago
        const isActive = Math.random() > 0.1; // 90% chance of being active
        const endDate = isActive ? null : new Date(startDate.getTime() + Math.floor(Math.random() * (now.getTime() - startDate.getTime())));

        const verified = Math.random() > 0.2; // 80% chance of being verified
        const verifiedBy = verified ? users[Math.floor(Math.random() * users.length)].id : null;
        const verifiedAt = verified ? new Date(startDate.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : null;

        const createdAt = startDate;

        // Generate notes
        const notes = [
          'Verified through corporate documents',
          'Confirmed via board resolution',
          'Documented in shareholder agreement',
          'Validated through public records',
          'Confirmed by legal counsel',
          null, null // Some associations have no notes
        ];
        const selectedNote = notes[Math.floor(Math.random() * notes.length)];

        associations.push({
          id: 'gen_random_uuid()',
          organization_entity_id: org.id,
          individual_entity_id: selectedIndividual.id,
          relationship_type: relationshipType,
          ownership_percentage: ownershipPercentage,
          ownership_type: ownershipType,
          position_title: positionTitle,
          has_signing_authority: hasSigningAuthority,
          start_date: startDate.toISOString().split('T')[0], // Date only
          end_date: endDate ? endDate.toISOString().split('T')[0] : null,
          is_active: isActive,
          verified: verified,
          verified_by: verifiedBy,
          verified_at: verifiedAt ? verifiedAt.toISOString() : null,
          notes: selectedNote,
          created_at: createdAt.toISOString(),
          created_by: randomUser.id
        });
      }
    }

    // Insert associations in batches
    const batchSize = 50;
    for (let i = 0; i < associations.length; i += batchSize) {
      const batch = associations.slice(i, i + batchSize);
      const values = batch.map(assoc => {
        const ownershipPercentageValue = assoc.ownership_percentage !== null ? assoc.ownership_percentage : 'NULL';
        const ownershipTypeValue = assoc.ownership_type ? `'${assoc.ownership_type}'` : 'NULL';
        const positionTitleValue = assoc.position_title ? `'${assoc.position_title.replace(/'/g, "''")}'` : 'NULL';
        const endDateValue = assoc.end_date ? `'${assoc.end_date}'` : 'NULL';
        const verifiedByValue = assoc.verified_by ? `'${assoc.verified_by}'` : 'NULL';
        const verifiedAtValue = assoc.verified_at ? `'${assoc.verified_at}'` : 'NULL';
        const notesValue = assoc.notes ? `'${assoc.notes.replace(/'/g, "''")}'` : 'NULL';

        return `(gen_random_uuid(), '${assoc.organization_entity_id}', '${assoc.individual_entity_id}', '${assoc.relationship_type}', ${ownershipPercentageValue}, ${ownershipTypeValue}, ${positionTitleValue}, ${assoc.has_signing_authority}, '${assoc.start_date}', ${endDateValue}, ${assoc.is_active}, ${assoc.verified}, ${verifiedByValue}, ${verifiedAtValue}, ${notesValue}, '${assoc.created_at}', '${assoc.created_by}')`;
      }).join(', ');

      await queryRunner.query(`
        INSERT INTO organization_associations (id, organization_entity_id, individual_entity_id, relationship_type, ownership_percentage, ownership_type, position_title, has_signing_authority, start_date, end_date, is_active, verified, verified_by, verified_at, notes, created_at, created_by)
        VALUES ${values}
      `);
    }

    console.log(`✅ Successfully seeded ${associations.length} organization associations`);

  } catch (error) {
    console.error('❌ Error seeding organization associations:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
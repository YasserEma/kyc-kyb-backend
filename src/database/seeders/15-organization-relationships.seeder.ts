import { DataSource } from 'typeorm';

export async function seedOrganizationRelationships(dataSource: DataSource): Promise<void> {
  console.log('🔄 Seeding organization relationships...');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // Check if the table exists (it was deprecated and removed in migration)
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'organization_relationships'
      );
    `);

    if (!tableExists[0].exists) {
      console.log('ℹ️ Table "organization_relationships" has been deprecated and replaced by "entity_relationships". Skipping seeding.');
      return;
    }

    // Check if relationships already exist
    const existingRelationships = await queryRunner.query('SELECT COUNT(*) as count FROM organization_relationships');
    if (parseInt(existingRelationships[0].count) > 0) {
      console.log('📋 Organization relationships already exist, skipping seeding');
      return;
    }

    // Get existing organization entities and users
    const organizations = await queryRunner.query(`
      SELECT oe.id, e.name, oe.legal_name, oe.organization_type
      FROM organization_entities oe 
      JOIN entities e ON oe.entity_id = e.id 
      WHERE e.entity_type = 'ORGANIZATION'
    `);
    const users = await queryRunner.query('SELECT id FROM subscriber_users');

    if (organizations.length < 2 || users.length === 0) {
      console.log('⚠️ Need at least 2 organizations and 1 user, skipping organization relationships seeding');
      return;
    }

    const relationshipTypes = [
      'PARENT', 'SUBSIDIARY', 'AFFILIATE', 'JOINT_VENTURE',
      'BRANCH', 'SISTER_COMPANY', 'PARTNER'
    ];

    const relationshipDescriptions: Record<string, string[]> = {
      'PARENT': ['Parent company with controlling interest', 'Holding company relationship', 'Corporate parent entity'],
      'SUBSIDIARY': ['Wholly owned subsidiary', 'Majority-owned subsidiary', 'Controlled subsidiary'],
      'AFFILIATE': ['Affiliated company', 'Associated entity', 'Related business entity'],
      'JOINT_VENTURE': ['Joint venture partnership', 'Strategic alliance', 'Collaborative business venture'],
      'BRANCH': ['Regional branch office', 'Local branch operation', 'Subsidiary branch'],
      'SISTER_COMPANY': ['Sister company under same parent', 'Related company', 'Sibling entity'],
      'PARTNER': ['Business partnership', 'Strategic partner', 'Commercial partner']
    };

    // Ownership percentages for different relationship types
    const ownershipRanges: Record<string, number[]> = {
      'PARENT': [51, 100], // Parent companies typically own majority or all
      'SUBSIDIARY': [0, 49], // From subsidiary perspective, they own less of parent
      'AFFILIATE': [10, 49], // Affiliates typically have minority stakes
      'JOINT_VENTURE': [25, 50], // Joint ventures often have significant but not controlling stakes
      'BRANCH': [100, 100], // Branches are fully owned
      'SISTER_COMPANY': [0, 0], // Sister companies don't own each other
      'PARTNER': [5, 25] // Partners typically have smaller stakes
    };

    const relationships = [];
    const now = new Date();
    const usedPairs = new Set(); // To avoid duplicate relationships

    // Generate relationships
    const numRelationships = Math.min(Math.floor(organizations.length * 0.3), 80); // 30% of organizations or max 80

    for (let i = 0; i < numRelationships; i++) {
      // Select two different organizations
      const primaryIndex = Math.floor(Math.random() * organizations.length);
      let relatedIndex = Math.floor(Math.random() * organizations.length);

      // Ensure we don't relate an organization to itself
      while (relatedIndex === primaryIndex) {
        relatedIndex = Math.floor(Math.random() * organizations.length);
      }

      const primaryOrg = organizations[primaryIndex];
      const relatedOrg = organizations[relatedIndex];

      // Create a unique pair identifier to avoid duplicates
      const pairKey = [primaryOrg.id, relatedOrg.id].sort().join('-');
      if (usedPairs.has(pairKey)) {
        continue; // Skip if this pair already has a relationship
      }
      usedPairs.add(pairKey);

      const relationshipType = relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)];
      const descriptions = relationshipDescriptions[relationshipType];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];

      // Calculate ownership percentage based on relationship type
      let ownershipPercentage = null;
      if (relationshipType !== 'SISTER_COMPANY' && Math.random() > 0.2) { // 80% chance of having ownership
        const [minOwnership, maxOwnership] = ownershipRanges[relationshipType];
        if (minOwnership === maxOwnership) {
          ownershipPercentage = minOwnership;
        } else {
          ownershipPercentage = Math.floor(Math.random() * (maxOwnership - minOwnership + 1)) + minOwnership;
        }
      }

      const randomUser = users[Math.floor(Math.random() * users.length)];

      // Generate dates
      const effectiveFrom = new Date(now.getTime() - Math.floor(Math.random() * 365 * 10) * 24 * 60 * 60 * 1000); // Up to 10 years ago
      const isActive = Math.random() > 0.15; // 85% chance of being active
      const effectiveTo = isActive ? null : new Date(effectiveFrom.getTime() + Math.floor(Math.random() * (now.getTime() - effectiveFrom.getTime())));

      const verified = Math.random() > 0.25; // 75% chance of being verified
      const verifiedBy = verified ? users[Math.floor(Math.random() * users.length)].id : null;
      const verifiedAt = verified ? new Date(effectiveFrom.getTime() + Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000) : null; // Verified within 60 days of creation

      const createdAt = effectiveFrom;

      relationships.push({
        id: 'gen_random_uuid()',
        primary_organization_id: primaryOrg.id,
        related_organization_id: relatedOrg.id,
        relationship_type: relationshipType,
        ownership_percentage: ownershipPercentage,
        relationship_description: description,
        effective_from: effectiveFrom.toISOString().split('T')[0], // Date only
        effective_to: effectiveTo ? effectiveTo.toISOString().split('T')[0] : null,
        is_active: isActive,
        verified: verified,
        verified_by: verifiedBy,
        verified_at: verifiedAt ? verifiedAt.toISOString() : null,
        created_at: createdAt.toISOString(),
        created_by: randomUser.id
      });

      // For certain relationship types, create the reciprocal relationship
      const reciprocalTypes: Record<string, string> = {
        'PARENT': 'SUBSIDIARY',
        'SUBSIDIARY': 'PARENT',
        'SISTER_COMPANY': 'SISTER_COMPANY',
        'PARTNER': 'PARTNER'
      };

      const reciprocalType = reciprocalTypes[relationshipType];
      if (reciprocalType && Math.random() > 0.4) { // 60% chance of creating reciprocal
        const reciprocalDescriptions = relationshipDescriptions[reciprocalType];
        const reciprocalDescription = reciprocalDescriptions[Math.floor(Math.random() * reciprocalDescriptions.length)];

        // Calculate reciprocal ownership percentage
        let reciprocalOwnership = null;
        if (reciprocalType !== 'SISTER_COMPANY' && ownershipPercentage !== null) {
          if (reciprocalType === 'SUBSIDIARY' && relationshipType === 'PARENT') {
            // Subsidiary typically owns 0% of parent
            reciprocalOwnership = 0;
          } else if (reciprocalType === 'PARENT' && relationshipType === 'SUBSIDIARY') {
            // Parent owns the percentage we calculated
            reciprocalOwnership = ownershipPercentage;
          } else {
            // For other types, use similar range
            const [minOwnership, maxOwnership] = ownershipRanges[reciprocalType];
            reciprocalOwnership = Math.floor(Math.random() * (maxOwnership - minOwnership + 1)) + minOwnership;
          }
        }

        relationships.push({
          id: 'gen_random_uuid()',
          primary_organization_id: relatedOrg.id,
          related_organization_id: primaryOrg.id,
          relationship_type: reciprocalType,
          ownership_percentage: reciprocalOwnership,
          relationship_description: reciprocalDescription,
          effective_from: effectiveFrom.toISOString().split('T')[0],
          effective_to: effectiveTo ? effectiveTo.toISOString().split('T')[0] : null,
          is_active: isActive,
          verified: verified,
          verified_by: verifiedBy,
          verified_at: verifiedAt ? verifiedAt.toISOString() : null,
          created_at: createdAt.toISOString(),
          created_by: randomUser.id
        });
      }
    }

    // Insert relationships in batches
    const batchSize = 50;
    for (let i = 0; i < relationships.length; i += batchSize) {
      const batch = relationships.slice(i, i + batchSize);
      const values = batch.map(rel => {
        const effectiveToValue = rel.effective_to ? `'${rel.effective_to}'` : 'NULL';
        const ownershipValue = rel.ownership_percentage !== null ? rel.ownership_percentage : 'NULL';
        const verifiedByValue = rel.verified_by ? `'${rel.verified_by}'` : 'NULL';
        const verifiedAtValue = rel.verified_at ? `'${rel.verified_at}'` : 'NULL';

        return `(gen_random_uuid(), '${rel.primary_organization_id}', '${rel.related_organization_id}', '${rel.relationship_type}', ${ownershipValue}, '${rel.relationship_description.replace(/'/g, "''")}', '${rel.effective_from}', ${effectiveToValue}, ${rel.is_active}, ${rel.verified}, ${verifiedByValue}, ${verifiedAtValue}, '${rel.created_at}', '${rel.created_by}')`;
      }).join(', ');

      await queryRunner.query(`
        INSERT INTO organization_relationships (id, primary_organization_id, related_organization_id, relationship_type, ownership_percentage, relationship_description, effective_from, effective_to, is_active, verified, verified_by, verified_at, created_at, created_by)
        VALUES ${values}
      `);
    }

    console.log(`✅ Successfully seeded ${relationships.length} organization relationships`);

  } catch (error) {
    console.error('❌ Error seeding organization relationships:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
import { DataSource } from 'typeorm';

export async function seedIndividualRelationships(dataSource: DataSource): Promise<void> {
  console.log('🔄 Seeding individual relationships...');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // Check if the table exists (it was deprecated and removed in migration)
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'individual_relationships'
      );
    `);

    if (!tableExists[0].exists) {
      console.log('ℹ️ Table "individual_relationships" has been deprecated and replaced by "entity_relationships". Skipping seeding.');
      return;
    }

    // Check if relationships already exist
    const existingRelationships = await queryRunner.query('SELECT COUNT(*) as count FROM individual_relationships');
    if (parseInt(existingRelationships[0].count) > 0) {
      console.log('📋 Individual relationships already exist, skipping seeding');
      return;
    }

    // Get existing individual entities and users
    const individuals = await queryRunner.query(`
      SELECT ie.id, e.name 
      FROM individual_entities ie 
      JOIN entities e ON ie.entity_id = e.id 
      WHERE e.entity_type = 'INDIVIDUAL'
    `);
    const users = await queryRunner.query('SELECT id FROM subscriber_users');

    if (individuals.length < 2 || users.length === 0) {
      console.log('⚠️ Need at least 2 individuals and 1 user, skipping individual relationships seeding');
      return;
    }

    const relationshipTypes = [
      'SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'RELATIVE',
      'BUSINESS_PARTNER', 'ASSOCIATE', 'GUARDIAN', 'BENEFICIARY'
    ];

    const relationshipDescriptions: Record<string, string[]> = {
      'SPOUSE': ['Married couple', 'Life partners', 'Civil union partners'],
      'CHILD': ['Biological child', 'Adopted child', 'Step child'],
      'PARENT': ['Biological parent', 'Adoptive parent', 'Step parent', 'Guardian'],
      'SIBLING': ['Brother', 'Sister', 'Half-sibling', 'Step-sibling'],
      'RELATIVE': ['Cousin', 'Uncle/Aunt', 'Nephew/Niece', 'Grandparent', 'Grandchild'],
      'BUSINESS_PARTNER': ['Co-founder', 'Joint venture partner', 'Business associate'],
      'ASSOCIATE': ['Professional colleague', 'Business contact', 'Industry peer'],
      'GUARDIAN': ['Legal guardian', 'Court-appointed guardian', 'Temporary guardian'],
      'BENEFICIARY': ['Insurance beneficiary', 'Trust beneficiary', 'Will beneficiary']
    };

    const relationships = [];
    const now = new Date();
    const usedPairs = new Set(); // To avoid duplicate relationships

    // Generate relationships
    const numRelationships = Math.min(Math.floor(individuals.length * 0.4), 100); // 40% of individuals or max 100

    for (let i = 0; i < numRelationships; i++) {
      // Select two different individuals
      const primaryIndex = Math.floor(Math.random() * individuals.length);
      let relatedIndex = Math.floor(Math.random() * individuals.length);

      // Ensure we don't relate an individual to themselves
      while (relatedIndex === primaryIndex) {
        relatedIndex = Math.floor(Math.random() * individuals.length);
      }

      const primaryIndividual = individuals[primaryIndex];
      const relatedIndividual = individuals[relatedIndex];

      // Create a unique pair identifier to avoid duplicates
      const pairKey = [primaryIndividual.id, relatedIndividual.id].sort().join('-');
      if (usedPairs.has(pairKey)) {
        continue; // Skip if this pair already has a relationship
      }
      usedPairs.add(pairKey);

      const relationshipType = relationshipTypes[Math.floor(Math.random() * relationshipTypes.length)];
      const descriptions = relationshipDescriptions[relationshipType];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];

      const randomUser = users[Math.floor(Math.random() * users.length)];

      // Generate dates
      const effectiveFrom = new Date(now.getTime() - Math.floor(Math.random() * 365 * 5) * 24 * 60 * 60 * 1000); // Up to 5 years ago
      const isActive = Math.random() > 0.1; // 90% chance of being active
      const effectiveTo = isActive ? null : new Date(effectiveFrom.getTime() + Math.floor(Math.random() * (now.getTime() - effectiveFrom.getTime())));

      const verified = Math.random() > 0.3; // 70% chance of being verified
      const verifiedBy = verified ? users[Math.floor(Math.random() * users.length)].id : null;
      const verifiedAt = verified ? new Date(effectiveFrom.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : null; // Verified within 30 days of creation

      const createdAt = effectiveFrom;

      relationships.push({
        id: 'gen_random_uuid()',
        primary_individual_id: primaryIndividual.id,
        related_individual_id: relatedIndividual.id,
        relationship_type: relationshipType,
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
        'SPOUSE': 'SPOUSE',
        'PARENT': 'CHILD',
        'CHILD': 'PARENT',
        'SIBLING': 'SIBLING'
      };

      const reciprocalType = reciprocalTypes[relationshipType];
      if (reciprocalType && Math.random() > 0.5) { // 50% chance of creating reciprocal
        const reciprocalDescriptions = relationshipDescriptions[reciprocalType];
        const reciprocalDescription = reciprocalDescriptions[Math.floor(Math.random() * reciprocalDescriptions.length)];

        relationships.push({
          id: 'gen_random_uuid()',
          primary_individual_id: relatedIndividual.id,
          related_individual_id: primaryIndividual.id,
          relationship_type: reciprocalType,
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
        const verifiedByValue = rel.verified_by ? `'${rel.verified_by}'` : 'NULL';
        const verifiedAtValue = rel.verified_at ? `'${rel.verified_at}'` : 'NULL';

        return `(gen_random_uuid(), '${rel.primary_individual_id}', '${rel.related_individual_id}', '${rel.relationship_type}', '${rel.relationship_description.replace(/'/g, "''")}', '${rel.effective_from}', ${effectiveToValue}, ${rel.is_active}, ${rel.verified}, ${verifiedByValue}, ${verifiedAtValue}, '${rel.created_at}', '${rel.created_by}')`;
      }).join(', ');

      await queryRunner.query(`
        INSERT INTO individual_relationships (id, primary_individual_id, related_individual_id, relationship_type, relationship_description, effective_from, effective_to, is_active, verified, verified_by, verified_at, created_at, created_by)
        VALUES ${values}
      `);
    }

    console.log(`✅ Successfully seeded ${relationships.length} individual relationships`);

  } catch (error) {
    console.error('❌ Error seeding individual relationships:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
// This script comments out the obsolete imports in the seeder file
const fs = require('fs');
const path = require('path');

const seederPath = path.join(__dirname, '..', 'src', 'database', 'seeders', '19-wizard-testing.seeder.ts');
let content = fs.readFileSync(seederPath, 'utf-8');

// Comment out the three obsolete imports (lines 6-8)
content = content.replace(
    /import { IndividualEntityRelationshipEntity } from '\.\.\/\.\.\/modules\/individual-entity-relationships\/entities\/individual-entity-relationship\.entity';\r?\n/,
    "// import { IndividualEntityRelationshipEntity } from '../../modules/individual-entity-relationships/entities/individual-entity-relationship.entity';\n"
);

content = content.replace(
    /import { OrganizationRelationshipEntity } from '\.\.\/\.\.\/modules\/organization-relationships\/entities\/organization-relationship\.entity';\r?\n/,
    "// import { OrganizationRelationshipEntity } from '../../modules/organization-relationships/entities/organization-relationship.entity';\n"
);

content = content.replace(
    /import { OrganizationEntityAssociationEntity } from '\.\.\/\.\.\/modules\/organization-entity-associations\/entities\/organization-entity-association\.entity';\r?\n/,
    "// import { OrganizationEntityAssociationEntity } from '../../modules/organization-entity-associations/entities/organization-entity-association.entity';\n"
);

fs.writeFileSync(seederPath, content);
console.log('✅ Seeder file fixed!');

$file = 'src\database\seeders\19-wizard-testing.seeder.ts'
$content = Get-Content $file -Raw

# Comment out imports
$content = $content -replace 'import \{ IndividualEntityRelationshipEntity \} from', '// import { IndividualEntityRelationshipEntity } from'
$content = $content -replace 'import \{ OrganizationRelationshipEntity \} from', '// import { OrganizationRelationshipEntity } from'
$content = $content -replace 'import \{ OrganizationEntityAssociationEntity \} from', '// import { OrganizationEntityAssociationEntity } from'

# Comment out the function call
$content = $content -replace '(\s+)await createWizardTestScenario3\(dataSource\);', '$1// await createWizardTestScenario3(dataSource); // Disabled - uses deleted relationship entities'

# Comment out the entire function definition createWizardTestScenario3 (line 390)
$content = $content -replace '(?ms)^(async function createWizardTestScenario3.*?^})', '/* $1 */'

# Comment out the entire clearWizardTestingData function
$content = $content -replace '(?ms)^(export async function clearWizardTestingData.*?^})', '/* $1 */'

$content | Set-Content $file -NoNewline

Write-Host "✅ Seeder file fixed!"

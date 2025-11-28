$file = 'src\database\seeders\19-wizard-testing.seeder.ts'
$content = Get-Content $file -Raw

# Comment out the 3 problematic imports
$content = $content -replace 'import \{ IndividualEntityRelationshipEntity \}', '// import { IndividualEntityRelationshipEntity }'
$content = $content -replace 'import \{ OrganizationRelationshipEntity \}', '// import { OrganizationRelationshipEntity }'
$content = $content -replace 'import \{ OrganizationEntityAssociationEntity \}', '// import { OrganizationEntityAssociationEntity }'

# Comment out the function calls
$content = $content -replace '  await createWizardTestScenario3\(dataSource\);', '  // await createWizardTestScenario3(dataSource); // Uses deleted relationship entities'

$content | Set-Content $file -NoNewline

Write-Host "✅ Seeder file fixed - commented out relationship scenario"

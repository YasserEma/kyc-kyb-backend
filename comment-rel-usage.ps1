$file = 'src\database\seeders\19-wizard-testing.seeder.ts'
$content = Get-Content $file -Raw

# Comment out the query builder blocks (lines 548-568)
$content = $content -replace '(?m)^  await individualRelRepo\.createQueryBuilder\(\)', '  // await individualRelRepo.createQueryBuilder()'
$content = $content -replace '(?m)^  await orgRelRepo\.createQueryBuilder\(\)', '  // await orgRelRepo.createQueryBuilder()'
$content = $content -replace '(?m)^  await orgAssocRepo\.createQueryBuilder\(\)', '  // await orgAssocRepo.createQueryBuilder()'

# Comment out the lines that chain after ths (where, delete, execute)
$content = $content -replace '(?m)^    \.where\(''primary_individual_id', '    // .where(''primary_individual_id'
$content = $content -replace '(?m)^    \.where\(''primary_organization_id', '    // .where(''primary_organization_id'  
$content = $content -replace '(?m)^    \.where\(''organization_id', '    // .where(''organization_id'
$content = $content -replace '(?m)^      ids: \[', '      // ids: ['
$content = $content -replace '(?m)^      id: ''660e8400', '      // id: ''660e8400'
$content = $content -replace '(?m)^      orgId:', '      // orgId:'
$content = $content -replace '(?m)^      indId:', '      // indId:'
$content = $content -replace '(?m)^    }\)\s*$', '    // })'
$content = $content -replace '(?m)^    \.delete\(\)\s*$', '    // .delete()'
$content = $content -replace '(?m)^    \.execute\(\);\s*$', '    // .execute();'

$content | Set-Content $file -NoNewline

Write-Host "✅ Commented out all relationship repository usage in seeder"

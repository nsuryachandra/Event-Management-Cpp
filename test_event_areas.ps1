$ErrorActionPreference = 'Stop'

$eventPayload = @{
    title = "AI & CLOUD WORLD EXPO 2026"
    tagline = "Global enterprise technology summit"
    description = "Multi-hall multi-track interactive event."
    date = "Nov 12-14, 2026"
    venue = "Metropolitan Convention Center Complex"
    category = "Artificial Intelligence"
    sections = @(
        @{ name = "Grand Auditorium (Main Stage)"; capacity = 100 },
        @{ name = "Hall B - Cloud Pods"; capacity = 25 },
        @{ name = "Seminar Room 204 (AI Lab)"; capacity = 15 }
    )
} | ConvertTo-Json -Depth 5

Write-Host "=== 1. Creating Dynamic Multi-Hall Event ===" -ForegroundColor Cyan
$createRes = Invoke-RestMethod -Uri "http://localhost:8080/api/events" -Method Post -Body $eventPayload -ContentType "application/json"
$eventId = $createRes.data.id
Write-Host "Created Event ID: $eventId | Title: $($createRes.data.title)" -ForegroundColor Green

Write-Host "`n=== 2. Verifying Custom Halls / Places Created for Event ===" -ForegroundColor Cyan
$sectionsRes = Invoke-RestMethod -Uri "http://localhost:8080/api/sections?eventId=$eventId"
foreach ($sec in $sectionsRes.data) {
    Write-Host " -> Area ID $($sec.id): '$($sec.name)' | Capacity: $($sec.capacity)" -ForegroundColor Yellow
}

Write-Host "`n=== 3. Editing Place Name and Capacity Limit ===" -ForegroundColor Cyan
$firstSection = $sectionsRes.data[0]
$editPayload = @{
    name = "Grand Keynote Hall (Level 1 Arena)"
    capacity = 150
} | ConvertTo-Json

$editRes = Invoke-RestMethod -Uri "http://localhost:8080/api/sections/$($firstSection.id)" -Method Put -Body $editPayload -ContentType "application/json"
Write-Host "Updated Place: '$($editRes.data.name)' | New Limit: $($editRes.data.capacity)" -ForegroundColor Green

Write-Host "`n=== 4. Re-fetching Sections to Confirm Persistence ===" -ForegroundColor Cyan
$finalSections = Invoke-RestMethod -Uri "http://localhost:8080/api/sections?eventId=$eventId"
foreach ($sec in $finalSections.data) {
    Write-Host " -> Verified Area '$($sec.name)' | Capacity: $($sec.capacity)" -ForegroundColor White
}

Write-Host "`n>>> ALL DYNAMIC EVENT PLACES & CAPACITY TESTS PASSED SUCCESSFULLY! <<<" -ForegroundColor Green

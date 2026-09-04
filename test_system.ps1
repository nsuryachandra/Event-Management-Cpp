# Automated Acceptance Test Suite for Smart Event Crowd & Resource Management System
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SMART EVENT MANAGEMENT - ACCEPTANCE VERIFICATION SUITE   " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api"
$runId = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

function Assert-Test($desc, $condition) {
    if ($condition) {
        Write-Host " [PASS] $desc" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] $desc" -ForegroundColor Red
        throw "Assertion failed: $desc"
    }
}

# 1. Test Events Catalog API
Write-Host "`n--> Testing GET /api/events..." -ForegroundColor Yellow
$eventsRes = Invoke-RestMethod -Uri "$baseUrl/events" -Method Get
Assert-Test "Events list returned successfully" ($eventsRes.success -eq $true -and $eventsRes.data.Count -ge 3)
$primaryEvent = $eventsRes.data[0]
$eventId = $primaryEvent.id
Write-Host "Active Event ID: $eventId ($($primaryEvent.title))" -ForegroundColor Gray

# 2. Test Dynamic Custom Track Creation & Capacity
Write-Host "`n--> Creating custom dynamic track with capacity = 1..." -ForegroundColor Yellow
$secRes = Invoke-RestMethod -Uri "$baseUrl/sections" -Method Post -Body (@{eventId=$eventId; name="VIP_Lounge_$runId"; capacity=1} | ConvertTo-Json) -ContentType "application/json"
Assert-Test "Custom VIP track created with capacity = 1" ($secRes.success -eq $true)
$vipTrack = $secRes.data.name
$vipSectionId = $secRes.data.id

# 3. Person 1 Registers -> Instant Admission
Write-Host "`n--> Person 1 (Alice) registers for $vipTrack..." -ForegroundColor Yellow
$reg1 = Invoke-RestMethod -Uri "$baseUrl/registrations" -Method Post -Body (@{eventId=$eventId; name="Alice Smith"; email="alice_$runId@test.com"; phone="+1 555-0101"; section=$vipTrack} | ConvertTo-Json) -ContentType "application/json"
Assert-Test "Alice admitted to $vipTrack (Seat 1/1)" ($reg1.data.status -eq "ADMITTED")

# 4. Person 2 Registers -> Enters FIFO Waiting Queue
Write-Host "`n--> Person 2 (Bob) registers for $vipTrack (Now Full)..." -ForegroundColor Yellow
$reg2 = Invoke-RestMethod -Uri "$baseUrl/registrations" -Method Post -Body (@{eventId=$eventId; name="Bob Vance"; email="bob_$runId@test.com"; phone="+1 555-0102"; section=$vipTrack} | ConvertTo-Json) -ContentType "application/json"
Assert-Test "Bob joined FIFO waiting queue" ($reg2.data.status -eq "WAITING")
Assert-Test "Bob is waiting at position > 0" ($reg2.data.waitingPosition -gt 0)

# 5. Person 3 Registers -> Enters FIFO Waiting Queue behind Bob
Write-Host "`n--> Person 3 (Charlie) registers for $vipTrack..." -ForegroundColor Yellow
$reg3 = Invoke-RestMethod -Uri "$baseUrl/registrations" -Method Post -Body (@{eventId=$eventId; name="Charlie Brown"; email="charlie_$runId@test.com"; phone="+1 555-0103"; section=$vipTrack} | ConvertTo-Json) -ContentType "application/json"
Assert-Test "Charlie joined FIFO queue behind Bob" ($reg3.data.status -eq "WAITING")

# 6. Organizer increases capacity by +1 -> Bob (First in FIFO) MUST automatically go inside!
Write-Host "`n--> Organizer increases $vipTrack capacity by +1 (from 1 to 2)..." -ForegroundColor Yellow
$updateCap = Invoke-RestMethod -Uri "$baseUrl/sections/$vipSectionId" -Method Put -Body (@{capacity=2} | ConvertTo-Json) -ContentType "application/json"
Assert-Test "Capacity update succeeded" ($updateCap.success -eq $true)
Assert-Test "First person in queue (Bob) was automatically admitted" ($updateCap.data.autoAdmittedCount -eq 1 -and $updateCap.data.autoAdmittedNames -like "*Bob Vance*")

# Verify Bob's live status is now ADMITTED
$lookupBob = Invoke-RestMethod -Uri "$baseUrl/registrations/bob_$runId@test.com" -Method Get
Assert-Test "Bob is now confirmed ADMITTED in database" ($lookupBob.data.status -eq "ADMITTED")

# Charlie should still be WAITING (Strict FIFO order preserved!)
$lookupCharlie = Invoke-RestMethod -Uri "$baseUrl/registrations/charlie_$runId@test.com" -Method Get
Assert-Test "Charlie is still WAITING in FIFO queue" ($lookupCharlie.data.status -eq "WAITING")

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "  DYNAMIC CAPACITY & FIFO AUTO-ADMISSION VERIFIED 100%!     " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

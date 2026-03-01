$ErrorActionPreference = 'Stop'
$backendDir = 'd:\Nurture-glow\Nurture-Glow\backend'
$base = 'http://localhost:4000'

function Test-Port($port) {
  try {
    $client = New-Object System.Net.Sockets.TcpClient('127.0.0.1', $port)
    $client.Close()
    return $true
  } catch {
    return $false
  }
}

$started = $false
$proc = $null
if (-not (Test-Port 4000)) {
  $proc = Start-Process -FilePath 'node' -ArgumentList 'src/index.js' -WorkingDirectory $backendDir -PassThru
  $started = $true
}

$ready = $false
for ($i = 0; $i -lt 25; $i++) {
  Start-Sleep -Seconds 1
  if (Test-Port 4000) { $ready = $true; break }
}
if (-not $ready) {
  if ($started -and $proc) { Stop-Process -Id $proc.Id -Force }
  throw 'Backend not reachable on port 4000'
}

try {
  $rand = Get-Random -Minimum 1000 -Maximum 9999
  $digit = Get-Random -Minimum 3 -Maximum 10
  $rest = Get-Random -Minimum 10000000 -Maximum 99999999
  $motherPhone = "+8801$digit$rest"
  $motherBody = @{
    name = "Test Mother"
    email = "mother$rand@example.com"
    phone = $motherPhone
    password = 'NurtureGlow!2026'
    role = 'mother'
    preferred_language = 'en'
  } | ConvertTo-Json
  $mother = Invoke-RestMethod -Method Post -Uri "$base/auth/register" -Body $motherBody -ContentType 'application/json'

  $rand2 = Get-Random -Minimum 1000 -Maximum 9999
  $digit2 = Get-Random -Minimum 3 -Maximum 10
  $rest2 = Get-Random -Minimum 10000000 -Maximum 99999999
  $adminPhone = "+8801$digit2$rest2"
  $adminBody = @{
    name = "Test Admin"
    email = "admin$rand2@example.com"
    phone = $adminPhone
    password = 'NurtureGlow!2026'
    role = 'system_admin'
    inviteCode = 'NURTURE_ADMIN_2026'
    preferred_language = 'en'
  } | ConvertTo-Json
  $admin = Invoke-RestMethod -Method Post -Uri "$base/auth/register" -Body $adminBody -ContentType 'application/json'

  $doctors = Invoke-RestMethod -Method Get -Uri "$base/api/catalog/doctors"
  $doctor = $doctors.items | Where-Object { $_.type -match 'Online|Both' } | Select-Object -First 1
  if (-not $doctor) { throw 'No online-capable doctors found in catalog' }
  $slot = $doctor.availableSlots[0]
  if (-not $slot) { $slot = '09:00 AM' }

  $date = (Get-Date).AddDays(1).ToString('yyyy-MM-dd')
  $apptBody = @{
    doctorId = $doctor.id
    date = $date
    time = $slot
    type = 'Online'
    status = 'scheduled'
  } | ConvertTo-Json
  $appt = Invoke-RestMethod -Method Post -Uri "$base/api/appointments" -Headers @{ Authorization = "Bearer $($mother.token)" } -Body $apptBody -ContentType 'application/json'
  $appointmentId = $appt.item.id

  $meeting = Invoke-RestMethod -Method Post -Uri "$base/api/appointments/$appointmentId/meeting/create" -Headers @{ Authorization = "Bearer $($mother.token)" } -Body (@{ appointment_id = $appointmentId } | ConvertTo-Json) -ContentType 'application/json'
  $meetingGet = Invoke-RestMethod -Method Get -Uri "$base/api/appointments/$appointmentId/meeting" -Headers @{ Authorization = "Bearer $($mother.token)" }
  $meetingEnd = Invoke-RestMethod -Method Post -Uri "$base/api/appointments/$appointmentId/meeting/end" -Headers @{ Authorization = "Bearer $($mother.token)" } -ContentType 'application/json'
  $meetingCancel = Invoke-RestMethod -Method Post -Uri "$base/api/appointments/$appointmentId/meeting/cancel" -Headers @{ Authorization = "Bearer $($admin.token)" } -ContentType 'application/json'

  Write-Output "Smoke test results:"
  Write-Output "- Registered mother: $($mother.user.email)"
  Write-Output "- Registered admin: $($admin.user.email)"
  Write-Output "- Appointment created: $appointmentId"
  Write-Output "- Meeting created: $($meeting.data.meetingData.roomName)"
  Write-Output "- Meeting fetched: $($meetingGet.data.meetingData.status)"
  Write-Output "- Meeting ended: $($meetingEnd.message)"
  Write-Output "- Meeting cancelled (admin): $($meetingCancel.message)"
} finally {
  if ($started -and $proc) { Stop-Process -Id $proc.Id -Force }
}

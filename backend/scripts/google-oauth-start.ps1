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
if (-not (Test-Port 4000)) {
  Start-Process -FilePath 'node' -ArgumentList 'src/index.js' -WorkingDirectory $backendDir | Out-Null
  $started = $true
}

$ready = $false
for ($i = 0; $i -lt 25; $i++) {
  Start-Sleep -Seconds 1
  if (Test-Port 4000) { $ready = $true; break }
}
if (-not $ready) {
  throw 'Backend not reachable on port 4000'
}

$rand = Get-Random -Minimum 1000 -Maximum 9999
$digit = Get-Random -Minimum 3 -Maximum 10
$rest = Get-Random -Minimum 10000000 -Maximum 99999999
$doctorPhone = "+8801$digit$rest"
$doctorBody = @{
  name = 'Test Doctor'
  email = "doctor$rand@example.com"
  phone = $doctorPhone
  password = 'NurtureGlow!2026'
  role = 'doctor'
  preferred_language = 'en'
} | ConvertTo-Json

$doctor = Invoke-RestMethod -Method Post -Uri "$base/auth/register" -Body $doctorBody -ContentType 'application/json'
$auth = Invoke-RestMethod -Method Get -Uri "$base/api/integrations/google/auth" -Headers @{ Authorization = "Bearer $($doctor.token)" }

Write-Output "Backend running: $ready"
Write-Output "Doctor user: $($doctor.user.email)"
Write-Output "Doctor user id: $($doctor.user.id)"
Write-Output "OAuth URL:"
Write-Output $auth.auth_url
if ($started) {
  Write-Output "Backend was started by this script and is still running for the OAuth callback."
}

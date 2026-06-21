$ErrorActionPreference = "Stop"
$Api = if ($env:OMNIFORGE_API_URL) { $env:OMNIFORGE_API_URL } else { "http://localhost:8003" }
$Node = if ($env:OMNIFORGE_NODE_URL) { $env:OMNIFORGE_NODE_URL } else { "http://localhost:8090" }

Write-Host "== OmniForge Smoke Test ==" -ForegroundColor Cyan
Write-Host "API: $Api"
Write-Host "Node: $Node"

function Assert-Ok {
  param([string]$Label, [scriptblock]$Action)
  try {
    $result = & $Action
    Write-Host "[OK] $Label" -ForegroundColor Green
    return $result
  } catch {
    Write-Host "[FAIL] $Label - $_" -ForegroundColor Red
    throw
  }
}

Assert-Ok "FastAPI health" { Invoke-RestMethod "$Api/healthz" -TimeoutSec 10 } | Out-Null
Assert-Ok "Node health" { Invoke-RestMethod "$Node/healthz" -TimeoutSec 10 } | Out-Null

$term = Assert-Ok "Node terminal execute" {
  Invoke-RestMethod "$Node/api/v1/terminal/execute" -Method Post -ContentType "application/json" -Body '{"command":"echo omnimind-ok"}' -TimeoutSec 30
}
if ($term.stdout -notmatch "omnimind-ok") { throw "terminal stdout missing expected text" }

$guestEmail = "smoke-$((Get-Random))@example.com"
$signupBody = "{`"email`":`"$guestEmail`",`"password`":`"SmokeTest!123456`"}"

$signup = Assert-Ok "Auth signup" {
  Invoke-RestMethod "$Api/api/v1/auth/signup" -Method Post -ContentType "application/json" -Body $signupBody -TimeoutSec 30
}
$token = $signup.access_token
if (-not $token) { throw "missing access_token" }

$headers = @{ Authorization = "Bearer $token" }

$projectBody = '{"name":"Smoke Project","description":"automated smoke"}'
$project = Assert-Ok "Create project" {
  Invoke-RestMethod "$Api/api/v1/projects" -Method Post -ContentType "application/json" -Headers $headers -Body $projectBody -TimeoutSec 30
}
$projectId = $project.id

$fileBody = '{"path":"src/main.ts","content":"export const ok = true;","language":"typescript"}'
Assert-Ok "Upsert file" {
  Invoke-RestMethod "$Api/api/v1/files/$projectId" -Method Post -ContentType "application/json" -Headers $headers -Body $fileBody -TimeoutSec 30
} | Out-Null

$files = Assert-Ok "List files" {
  Invoke-RestMethod "$Api/api/v1/files/$projectId" -Headers $headers -TimeoutSec 30
}
if ($files.items.Count -lt 1) { throw "expected at least one file" }

$chatBody = "{`"project_id`":`"$projectId`",`"message`":`"Reply with exactly: smoke-ok`",`"provider_hint`":`"auto`"}"
$chat = Assert-Ok "Chat route" {
  Invoke-RestMethod "$Api/api/v1/chat" -Method Post -ContentType "application/json" -Headers $headers -Body $chatBody -TimeoutSec 60
}
if (-not $chat.assistant) { throw "chat returned empty assistant" }
Write-Host "Chat provider: $($chat.provider)" -ForegroundColor DarkGray
$excerpt = $chat.assistant
if ($excerpt.Length -gt 120) { $excerpt = $excerpt.Substring(0, 120) + "..." }
Write-Host "Chat excerpt: $excerpt" -ForegroundColor DarkGray

$termProxyBody = '{"command":"echo proxy-ok"}'
$termProxy = Assert-Ok "Terminal proxy via FastAPI" {
  Invoke-RestMethod "$Api/api/v1/terminal/execute" -Method Post -ContentType "application/json" -Headers $headers -Body $termProxyBody -TimeoutSec 30
}
if ($termProxy.stdout -notmatch "proxy-ok") { throw "proxy terminal stdout missing expected text" }

Write-Host ""
Write-Host "All smoke checks passed." -ForegroundColor Green

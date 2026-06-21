# Quick health test before publish
$ErrorActionPreference = "Continue"
$root = $PSScriptRoot
$ports = @("8000", "8001")
$apiBase = $null

foreach ($p in $ports) {
    try {
        $r = Invoke-WebRequest -Uri "http://127.0.0.1:$p/" -UseBasicParsing -TimeoutSec 3
        if ($r.StatusCode -eq 200) { $apiBase = "http://127.0.0.1:$p"; break }
    } catch {}
}

if (-not $apiBase) {
    Write-Host "FAIL: Backend not running. Run .\OMNIMIND-START.ps1" -ForegroundColor Red
    exit 1
}

Write-Host "API: $apiBase" -ForegroundColor Green

$checks = @(
    @{ Name = "Health"; Url = "$apiBase/" },
    @{ Name = "Integrations"; Url = "$apiBase/integrations" },
    @{ Name = "LM Studio"; Url = "$apiBase/health/lmstudio" },
    @{ Name = "MongoDB"; Url = "$apiBase/health/db" },
    @{ Name = "Readiness"; Url = "$apiBase/api/v1/platform/readiness" }
)

$failed = 0
foreach ($c in $checks) {
    try {
        $r = Invoke-WebRequest -Uri $c.Url -UseBasicParsing -TimeoutSec 8
        Write-Host "OK  $($c.Name) ($($r.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "FAIL $($c.Name) — $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

try {
    docker ps --format "{{.Names}}: {{.Status}}" 2>$null | Select-String "omnimind"
} catch {
    Write-Host "SKIP Docker (not running)" -ForegroundColor Yellow
}

if ($failed -gt 0) {
    Write-Host "`nSome checks failed — chat may still work with LM Studio." -ForegroundColor Yellow
    exit 1
}

Write-Host "`nAll core checks passed. Open http://localhost:3000" -ForegroundColor Green
exit 0

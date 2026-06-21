# Free port 8001 and restart OmniMind API (uvicorn).
# Run from project root:  .\scripts\restart-backend-8001.ps1

$ErrorActionPreference = "Continue"
$PreferredPort = 8001
$FallbackPort = 8002
$Root = Split-Path $PSScriptRoot -Parent
Set-Location $Root

& "$PSScriptRoot\free-port-8001.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

$Port = $PreferredPort
$stale8001 = Get-NetTCPConnection -LocalPort $PreferredPort -State Listen -ErrorAction SilentlyContinue
if ($stale8001) {
    $live = $false
    foreach ($conn in $stale8001) {
        if ($conn.OwningProcess -gt 0 -and (Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue)) {
            $live = $true
            break
        }
    }
    if (-not $live) {
        Write-Host "Port $PreferredPort has stale sockets - using $FallbackPort for this session." -ForegroundColor Yellow
        $Port = $FallbackPort
        & "$PSScriptRoot\free-port-8001.ps1" -Port $FallbackPort
    }
}

Write-Host "Starting API on port $Port ..." -ForegroundColor Green
$logDir = Join-Path $Root "backend\data\logs"
$envFile = Join-Path $Root "backend\.env"
if (Test-Path $envFile) {
    Get-Content $envFile -Encoding UTF8 | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) { return }
        $eq = $line.IndexOf("=")
        if ($eq -lt 1) { return }
        $name = $line.Substring(0, $eq).Trim()
        $value = $line.Substring($eq + 1).Trim().Trim('"').Trim("'")
        if ($name -and $value) { Set-Item -Path "env:$name" -Value $value }
    }
}
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logOut = Join-Path $logDir "uvicorn-8001.out.log"
$logErr = Join-Path $logDir "uvicorn-8001.err.log"

Start-Process -FilePath "python" `
    -ArgumentList @(
        "-m", "uvicorn", "main:app",
        "--host", "127.0.0.1",
        "--port", "$Port"
    ) `
    -WorkingDirectory (Join-Path $Root "backend") `
    -WindowStyle Hidden `
    -RedirectStandardOutput $logOut `
    -RedirectStandardError $logErr

Start-Sleep -Seconds 10
try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/" -UseBasicParsing -TimeoutSec 8
    Write-Host "API online: http://127.0.0.1:$Port/ (HTTP $($r.StatusCode))" -ForegroundColor Green
    Write-Host "Logs: $logOut" -ForegroundColor DarkGray
} catch {
    Write-Host "API not responding yet - check $logOut and $logErr" -ForegroundColor Yellow
}

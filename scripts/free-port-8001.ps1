# Release TCP port on Windows (stale uvicorn/python listeners).
param([int]$Port = 8001)
$ErrorActionPreference = "Continue"

function Stop-PortListeners([int]$port) {
    $pids = @()
    try {
        $pids = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty OwningProcess -Unique
    } catch {
        $netstat = netstat -ano | Select-String ":$port\s"
        foreach ($row in $netstat) {
            if ($row -match '\s+(\d+)\s*$') { $pids += [int]$Matches[1] }
        }
        $pids = $pids | Select-Object -Unique
    }

    foreach ($procId in $pids) {
        if ($procId -le 0) { continue }
        try {
            $p = Get-Process -Id $procId -ErrorAction SilentlyContinue
            if ($p) {
                Write-Host "Stopping PID $procId ($($p.ProcessName)) on port $port ..." -ForegroundColor Yellow
                Stop-Process -Id $procId -Force -ErrorAction Stop
            }
        } catch {
            Write-Host "Could not stop PID ${procId}: $_" -ForegroundColor Red
        }
    }
}

Write-Host "=== Free port $Port ===" -ForegroundColor Cyan
for ($round = 1; $round -le 3; $round++) {
    Stop-PortListeners -port $Port
    Get-CimInstance Win32_Process -Filter "Name = 'python.exe'" -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -match 'uvicorn' } |
        ForEach-Object {
            Write-Host "Stopping uvicorn PID $($_.ProcessId) ..." -ForegroundColor Yellow
            Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
        }
    Start-Sleep -Seconds 2
}

$listen = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($listen) {
    $orphan = $true
    foreach ($conn in $listen) {
        $procId = $conn.OwningProcess
        if ($procId -gt 0 -and (Get-Process -Id $procId -ErrorAction SilentlyContinue)) {
            $orphan = $false
            break
        }
    }
    if (-not $orphan) {
        Write-Host "Port $Port still locked. Close other terminals or run PowerShell as Administrator." -ForegroundColor Red
        exit 1
    }
    Write-Host "Port $Port shows stale socket entry (no live process) - continuing." -ForegroundColor Yellow
}

Write-Host "Port $Port is available." -ForegroundColor Green
exit 0

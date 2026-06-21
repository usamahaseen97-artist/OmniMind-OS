# Start Kafka + Spark for OmniMind streaming (requires Docker Desktop)
$ErrorActionPreference = "Continue"
$root = $PSScriptRoot

Write-Host "OmniMind — Docker streaming stack" -ForegroundColor Magenta

try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Docker not ready" }
} catch {
    Write-Host "ERROR: Start Docker Desktop first, then re-run this script." -ForegroundColor Red
    exit 1
}

Set-Location $root
Write-Host "Pulling images (first run may take a few minutes)..." -ForegroundColor Yellow
docker compose pull kafka spark-master spark-worker 2>$null

Write-Host "Starting Kafka..." -ForegroundColor Cyan
docker compose up -d kafka
Start-Sleep -Seconds 3

Write-Host "Starting Spark master + worker..." -ForegroundColor Cyan
docker compose up -d spark-master spark-worker

Write-Host "`nContainer status:" -ForegroundColor Green
docker compose ps

Write-Host "`nKafka:  localhost:9092" -ForegroundColor White
Write-Host "Spark UI: http://localhost:8080" -ForegroundColor White
Write-Host "Wake from API: POST http://127.0.0.1:8000/api/streaming/kafka/health`n" -ForegroundColor DarkGray

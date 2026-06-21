# Normalize elasticsearch.yml — strip bad indentation on cluster/security keys.
$ErrorActionPreference = "Continue"

$clusterKey = '^(xpack\.|cluster\.|node\.|network\.|http\.|discovery\.|path\.|bootstrap\.|action\.)'

$candidates = @(
    "$PSScriptRoot\..\config\elasticsearch\elasticsearch.yml",
    "$PSScriptRoot\..\elasticsearch.yml",
    "C:\elasticsearch\config\elasticsearch.yml",
    "$env:ProgramFiles\Elastic\Elasticsearch\config\elasticsearch.yml",
    "$env:USERPROFILE\elasticsearch\config\elasticsearch.yml"
)

function Normalize-YamlLine([string]$line) {
    if ($line -match '^\s+#') {
        return $line.TrimStart()
    }
    if ($line -match $clusterKey) {
        return $line.TrimStart()
    }
    return $line
}

$fixed = 0
foreach ($path in $candidates) {
    $full = [System.IO.Path]::GetFullPath($path)
    if (-not (Test-Path $full)) { continue }

    $raw = Get-Content -Path $full -Encoding UTF8
    $lines = @($raw | ForEach-Object { Normalize-YamlLine $_ })
    $changed = ($lines -join "`n") -ne ($raw -join "`n")

    if ($changed) {
        Set-Content -Path $full -Value $lines -Encoding UTF8 -NoNewline:$false
        Write-Host "Normalized indentation: $full" -ForegroundColor Green
        $fixed++
    } else {
        Write-Host "OK: $full" -ForegroundColor DarkGray
    }
}

if ($fixed -eq 0) {
    Write-Host "Project template: config\elasticsearch\elasticsearch.yml" -ForegroundColor Cyan
}

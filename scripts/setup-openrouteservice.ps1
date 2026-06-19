param(
    [string]$ApiKey = "",
    [string]$BaseUrl = "https://api.openrouteservice.org/v2",
    [switch]$PersistUserEnvironment
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$envPath = Join-Path $repoRoot ".env"

if ([string]::IsNullOrWhiteSpace($ApiKey)) {
    $ApiKey = Read-Host "OpenRouteService API key"
}

if ([string]::IsNullOrWhiteSpace($ApiKey)) {
    throw "OpenRouteService API key is required."
}

$existing = @{}
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) {
            return
        }
        $separator = $line.IndexOf("=")
        if ($separator -le 0) {
            return
        }
        $key = $line.Substring(0, $separator).Trim()
        $value = $line.Substring($separator + 1)
        $existing[$key] = $value
    }
}

$existing["APP_ORS_BASE_URL"] = $BaseUrl
$existing["OpenRouteService_KEY"] = $ApiKey

$content = $existing.GetEnumerator() |
    Sort-Object Name |
    ForEach-Object { "$($_.Name)=$($_.Value)" }

Set-Content -LiteralPath $envPath -Value $content -Encoding UTF8
Write-Host "Wrote OpenRouteService configuration to $envPath"

if ($PersistUserEnvironment) {
    [Environment]::SetEnvironmentVariable("APP_ORS_BASE_URL", $BaseUrl, "User")
    [Environment]::SetEnvironmentVariable("OpenRouteService_KEY", $ApiKey, "User")
    Write-Host "Also saved ORS variables to your Windows user environment. Open a new terminal before running the backend."
}

Write-Host "Next step: restart the backend so it reloads .env and picks up the ORS key."

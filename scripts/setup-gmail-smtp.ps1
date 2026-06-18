param(
    [string]$Email = "",
    [switch]$PersistUserEnvironment
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$envPath = Join-Path $repoRoot ".env"

if ([string]::IsNullOrWhiteSpace($Email)) {
    $Email = Read-Host "Gmail sender address"
}

if ([string]::IsNullOrWhiteSpace($Email) -or $Email -notmatch "^[^@\s]+@gmail\.com$") {
    throw "Please enter a valid Gmail address, for example vbas.rescue.noreply@gmail.com."
}

$securePassword = Read-Host "Gmail App Password (16 characters, not the normal Gmail password)" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
    $appPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

$appPassword = ($appPassword -replace "\s", "")
if ($appPassword.Length -lt 16) {
    throw "The Gmail App Password looks too short. Create an App Password from Google Account security settings."
}

$lines = @(
    "MAIL_HOST=smtp.gmail.com",
    "MAIL_PORT=587",
    "MAIL_USERNAME=$Email",
    "MAIL_PASSWORD=$appPassword",
    "MAIL_FROM=VBAS Rescue <$Email>",
    "MAIL_SMTP_AUTH=true",
    "MAIL_SMTP_STARTTLS=true"
)

Set-Content -LiteralPath $envPath -Value $lines -Encoding UTF8
Write-Host "Wrote local mail configuration to $envPath"
Write-Host "This file is ignored by Git. Do not commit App Passwords."

if ($PersistUserEnvironment) {
    [Environment]::SetEnvironmentVariable("MAIL_HOST", "smtp.gmail.com", "User")
    [Environment]::SetEnvironmentVariable("MAIL_PORT", "587", "User")
    [Environment]::SetEnvironmentVariable("MAIL_USERNAME", $Email, "User")
    [Environment]::SetEnvironmentVariable("MAIL_PASSWORD", $appPassword, "User")
    [Environment]::SetEnvironmentVariable("MAIL_FROM", "VBAS Rescue <$Email>", "User")
    [Environment]::SetEnvironmentVariable("MAIL_SMTP_AUTH", "true", "User")
    [Environment]::SetEnvironmentVariable("MAIL_SMTP_STARTTLS", "true", "User")
    Write-Host "Also saved MAIL_* variables to your Windows user environment. Open a new terminal before running the backend."
}

Write-Host "Next step: restart the backend from the repository root with .\mvnw.cmd spring-boot:run"

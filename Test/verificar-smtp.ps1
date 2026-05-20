# Verifica SMTP con MailKit (misma lógica que Trebol.EmailHelper)
$probeDir = Join-Path $PSScriptRoot "smtp-probe"
if (-not (Test-Path $probeDir)) { Write-Error "No existe $probeDir"; exit 1 }
Push-Location $probeDir
try {
  dotnet run
  exit $LASTEXITCODE
} finally {
  Pop-Location
}

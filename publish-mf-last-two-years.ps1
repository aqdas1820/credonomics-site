$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " CREDONOMICS - PUBLISH HDFC MF DATA (2025 + 2026)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".\app\tools\mf-portfolio-tracker\page.tsx")) {
    Write-Host "ERROR: Run this from the CredoNomics project root." -ForegroundColor Red
    exit 1
}

$source = "D:\MF Tracking\Reports\Master_Portfolio_HDFC_V5_8_FULL.xlsx"
$publisher = ".\scripts\mf_site\publish_hdfc_2025_2026.py"
$out = ".\public\data\mf-intelligence"

python $publisher --source $source --output $out
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Running production build..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Nothing will be pushed." -ForegroundColor Red
    exit $LASTEXITCODE
}

git reset | Out-Host

$files = @(
    "public/data/mf-intelligence/all.json",
    "public/data/mf-intelligence/status.json",
    "public/data/mf-intelligence/all.csv",
    "scripts/mf_site/publish_hdfc_2025_2026.py"
)

foreach ($f in $files) {
    git add -- $f
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$staged = @(git diff --cached --name-only)
$unexpected = @($staged | Where-Object { $files -notcontains $_ })

if ($unexpected.Count -gt 0) {
    Write-Host "SAFETY STOP: Unexpected staged files:" -ForegroundColor Red
    $unexpected | ForEach-Object { Write-Host "  $_" }
    git reset | Out-Host
    exit 1
}

git diff --cached --check
if ($LASTEXITCODE -ne 0) {
    git reset | Out-Host
    exit $LASTEXITCODE
}

git commit -m "Publish HDFC mutual fund portfolio data for 2025 and 2026"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

git push origin main
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "SUCCESS - MF DATA PUBLISHED" -ForegroundColor Green
Write-Host "https://www.credonomics.in/tools/mf-portfolio-tracker" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " CREDONOMICS - ADD MF PORTFOLIO TRACKER TO TOOLS PAGE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

$toolsPage = ".\app\tools\page.tsx"
$trackerPage = ".\app\tools\mf-portfolio-tracker\page.tsx"

if (-not (Test-Path ".\package.json") -or -not (Test-Path $toolsPage)) {
    Write-Host "ERROR: Run this script from the CredoNomics project root." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $trackerPage)) {
    Write-Host "ERROR: MF Portfolio Tracker route does not exist:" -ForegroundColor Red
    Write-Host "  $trackerPage"
    exit 1
}

$backup = ".\app\tools\page.tsx.before-mf-link.bak"
Copy-Item $toolsPage $backup -Force

$text = Get-Content $toolsPage -Raw

if ($text -match 'href="/tools/mf-portfolio-tracker"') {
    Write-Host "MF Portfolio Tracker is already present on the Tools page." -ForegroundColor Yellow
} else {
    $anchor = @'
          <a className={`${styles.toolCard} ${styles.researchCard}`} href="/methodology">
'@

    $mfCard = @'
          <a className={styles.toolCard} href="/tools/mf-portfolio-tracker">
            <div className={styles.cardTop}>
              <span className={styles.iconTile}><FileSearch size={22}/></span>
              <span className={styles.statusPill}><i className={styles.liveDot}/> Live</span>
            </div>
            <span className={styles.cardLabel}>04 / Mutual Fund Intelligence</span>
            <h3>MF Portfolio Tracker</h3>
            <p>Track HDFC mutual fund portfolio holdings across 2025 and 2026, compare schemes and months, and study stock and sector changes.</p>
            <div className={styles.cardFooter}><span>Portfolio intelligence</span><ArrowUpRight size={16}/></div>
          </a>

'@

    if (-not $text.Contains($anchor)) {
        Write-Host "ERROR: Could not find the Methodology card insertion point." -ForegroundColor Red
        Write-Host "No file was changed. Backup created at $backup" -ForegroundColor Yellow
        exit 1
    }

    $text = $text.Replace($anchor, $mfCard + $anchor)
    $text = $text.Replace(
        '<span className={styles.cardLabel}>04 / Verification</span>',
        '<span className={styles.cardLabel}>05 / Verification</span>'
    )
    $text = $text.Replace(
        "description: 'CredoNomics calculators for credit-card selection, cashback economics and fuel-card savings in India.',",
        "description: 'CredoNomics tools for credit-card decisions, cashback and fuel economics, plus mutual-fund portfolio intelligence in India.',"
    )

    Set-Content -Path $toolsPage -Value $text -Encoding UTF8
    Write-Host "MF Portfolio Tracker card added." -ForegroundColor Green
}

Write-Host ""
Write-Host "Files that should be published:" -ForegroundColor Cyan
Write-Host "  app/tools/page.tsx"
Write-Host "  app/tools/mf-portfolio-tracker/page.tsx"
Write-Host ""
Write-Host "Current diff:" -ForegroundColor Cyan
git diff -- $toolsPage $trackerPage

Write-Host ""
Write-Host "NEXT COMMANDS:" -ForegroundColor Yellow
Write-Host 'git reset'
Write-Host 'git add -- "app/tools/page.tsx"'
Write-Host 'git add -- "app/tools/mf-portfolio-tracker/page.tsx"'
Write-Host 'git diff --cached --name-only'
Write-Host ""
Write-Host "Expected staged files ONLY:" -ForegroundColor Yellow
Write-Host "  app/tools/page.tsx"
Write-Host "  app/tools/mf-portfolio-tracker/page.tsx"
Write-Host ""
Write-Host 'Then: git commit -m "Publish MF Portfolio Tracker on Tools page"'
Write-Host 'Then: git push origin main'
Write-Host ""
Write-Host "NOTE: The existing OpenGraph/Twitter image build failure is separate." -ForegroundColor DarkYellow
Write-Host "This patch does not modify those routes." -ForegroundColor DarkYellow

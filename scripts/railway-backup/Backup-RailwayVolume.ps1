#requires -Version 5.1
[CmdletBinding()]
param([Parameter(Mandatory)][ValidateSet('staging','production')][string]$Target,
    [Parameter(Mandatory)][string]$ProfilePath,
    [Parameter(Mandatory)][string]$BackupId,
    [Parameter(Mandatory)][string]$KnownHosts,
    [switch]$VaultConfirmed, [switch]$ZeroAdditionalCostConfirmed, [switch]$WritersQuiesced)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
try {
    if (!$VaultConfirmed -or !$ZeroAdditionalCostConfirmed -or !$WritersQuiesced) { throw 'Operator must confirm mounted encrypted vault, zero incremental cost, and quiesced writers' }
    Import-Module (Join-Path $PSScriptRoot 'Backup.Core.psm1') -Force
    $profile = Get-Content -LiteralPath $ProfilePath -Raw | ConvertFrom-Json
    if ($profile.target -cne $Target) { throw 'Profile target mismatch' }
    $runner = {
        param($program,$arguments)
        $output = & $program @arguments 2>$null
        $code = $LASTEXITCODE
        [pscustomobject]@{ ExitCode = $code; Output = ($output -join "`n") }
    }
    Invoke-CNVolumeBackup -Profile $profile -VaultRoot 'R:\CredoNomics-recovery' -BackupId $BackupId -Runner $runner -KnownHosts $KnownHosts
    exit 0
} catch { Write-Error $_.Exception.Message -ErrorAction Continue; exit 1 }

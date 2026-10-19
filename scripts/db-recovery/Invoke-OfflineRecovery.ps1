#requires -Version 5.1
[CmdletBinding()]
param([Parameter(Mandatory)][ValidateSet('Synthetic','Restore','ClassifyLog')][string]$Mode,
    [string]$Manifest, [string]$Workspace, [string]$Log,
    [switch]$VaultConfirmed, [switch]$HostMemoryProtected, [switch]$AuthorizeLocalRestore)
$ErrorActionPreference = 'Stop'
$tool = Join-Path $PSScriptRoot 'recovery.py'
if ($Mode -eq 'Synthetic') { & python $tool synthetic }
elseif ($Mode -eq 'ClassifyLog') {
    if (!$VaultConfirmed -or !$Log) { throw 'Encrypted vault confirmation and exact private log path required' }
    & python $tool classify-log --log $Log
} else {
    if (!$VaultConfirmed -or !$HostMemoryProtected -or !$AuthorizeLocalRestore -or !$Manifest -or !$Workspace) {
        throw 'Restore requires exact private manifest/workspace, encrypted vault and protected memory attestations plus local restore authorization'
    }
    & python $tool restore --manifest $Manifest --workspace $Workspace --vault-confirmed --host-memory-protected --authorize-local-restore
}
if ($LASTEXITCODE -ne 0) { throw 'Offline recovery validation failed or blocked; no success is certified' }

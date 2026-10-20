#requires -Version 5.1
[CmdletBinding()]
param([Parameter(Mandatory)][ValidateSet('export','restore')][string]$Mode,
    [Parameter(Mandatory)][string]$PgBin,
    [Parameter(Mandatory)][string]$Workspace,
    [string]$Profile, [string]$Backup,
    [switch]$VaultConfirmed, [switch]$WritersQuiesced, [switch]$AuthorizeLocalRestore,
    [switch]$NetworkDisconnected, [switch]$HostMemoryProtected, [switch]$RolesReviewed)
$ErrorActionPreference='Stop'
$argsList=@((Join-Path $PSScriptRoot 'hosted_backup.py'),$Mode,'--pg-bin',$PgBin,'--workspace',$Workspace)
if ($Profile) { $argsList+=@('--profile',$Profile) }
if ($Backup) { $argsList+=@('--backup',$Backup) }
foreach ($entry in @(@($VaultConfirmed,'--vault-confirmed'),@($WritersQuiesced,'--writers-quiesced'),
    @($AuthorizeLocalRestore,'--authorize-local-restore'),@($NetworkDisconnected,'--network-disconnected'),
    @($HostMemoryProtected,'--host-memory-protected'),@($RolesReviewed,'--roles-reviewed'))) {
    if ($entry[0]) { $argsList+=$entry[1] }
}
& python @argsList
if ($LASTEXITCODE -ne 0) { throw 'Recovery blocked; no PASS is certified' }

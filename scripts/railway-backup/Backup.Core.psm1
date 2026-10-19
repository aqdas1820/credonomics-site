Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Assert-NoLinks([string]$Path) {
    $cursor = [IO.Path]::GetFullPath($Path)
    while ($cursor) {
        if (Test-Path -LiteralPath $cursor) {
            if ((Get-Item -LiteralPath $cursor -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Reparse point refused' }
        }
        $parent = Split-Path -Parent $cursor
        if ($parent -eq $cursor) { break }; $cursor = $parent
    }
}
function Invoke-Checked($Runner, [string]$Program, [string[]]$Arguments) {
    $result = & $Runner $Program $Arguments
    if ($null -eq $result -or $result.ExitCode -ne 0) { throw "Command failed: $Program (output withheld; retained data stays in vault)" }
    return [string]$result.Output
}
function Write-NewJson([string]$Path, $Value) {
    $bytes = [Text.UTF8Encoding]::new($false).GetBytes((ConvertTo-Json -InputObject $Value -Depth 30))
    $stream = [IO.File]::Open($Path, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
    try { $stream.Write($bytes, 0, $bytes.Length); $stream.Flush($true) } finally { $stream.Dispose() }
}
function Get-CanonicalInventory($Entries) {
    $rows = @($Entries | Sort-Object -Property path -CaseSensitive | ForEach-Object {
        [ordered]@{ path = [string]$_.path; kind = [string]$_.kind; size = [long]$_.size; sha256 = $_.sha256 }
    })
    return ConvertTo-Json -InputObject $rows -Depth 8 -Compress
}
function Get-LocalInventory([string]$Root) {
    Assert-NoLinks $Root
    $base = [IO.Path]::GetFullPath($Root).TrimEnd('\')
    $entries = @(Get-ChildItem -LiteralPath $base -Force -Recurse | ForEach-Object {
        Assert-NoLinks $_.FullName
        $directory = $_.PSIsContainer
        [ordered]@{ path = $_.FullName.Substring($base.Length + 1).Replace('\','/');
            kind = $(if ($directory) { 'directory' } else { 'file' });
            size = $(if ($directory) { 0 } else { $_.Length });
            sha256 = $(if ($directory) { $null } else { (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant() }) }
    })
    return Get-CanonicalInventory $entries
}
function Assert-Identity($Profile, $Status) {
    if ($Status.id -cne $Profile.projectId -or $Status.name -cne $Profile.projectName) { throw 'Project identity mismatch' }
    $envs = @($Status.environments.edges | ForEach-Object { $_.node } | Where-Object { $_.id -ceq $Profile.environmentId -and $_.name -ceq $Profile.environmentName })
    if ($envs.Count -ne 1) { throw 'Environment identity mismatch' }
    $services = @($Status.services.edges | ForEach-Object { $_.node } | Where-Object { $_.id -ceq $Profile.serviceId -and $_.name -ceq $Profile.serviceName })
    if ($services.Count -ne 1) { throw 'Service identity mismatch' }
    $envNode = $envs[0]
    $instances = @($envNode.serviceInstances.edges | ForEach-Object { $_.node } | Where-Object { $_.serviceId -ceq $Profile.serviceId -and $_.environmentId -ceq $Profile.environmentId -and $_.id -ceq $Profile.serviceInstanceId })
    $volumes = @($envNode.volumeInstances.edges | ForEach-Object { $_.node } | Where-Object { $_.volume.id -ceq $Profile.volumeId -and $_.volume.name -ceq $Profile.volumeName -and $_.environmentId -ceq $Profile.environmentId -and $_.serviceId -ceq $Profile.serviceId -and $_.mountPath -ceq '/data' -and $_.isPendingDeletion -eq $false -and $null -eq $_.deletedAt })
    if ($instances.Count -ne 1 -or $volumes.Count -ne 1) { throw 'Volume/instance identity mismatch' }
}
function Invoke-CNVolumeBackup {
    [CmdletBinding()]
    param([Parameter(Mandatory)]$Profile, [Parameter(Mandatory)][string]$VaultRoot,
        [Parameter(Mandatory)][string]$BackupId, [Parameter(Mandatory)]$Runner,
        [Parameter(Mandatory)][string]$KnownHosts, [switch]$Synthetic)
    if ($Profile.target -cnotin @('staging','production') -or $BackupId -cnotmatch '^[a-zA-Z0-9_-]{1,60}$') { throw 'Unsafe target/backup ID' }
    foreach ($field in @('projectId','environmentId','serviceId','serviceInstanceId','volumeId')) {
        if ($Profile.$field -notmatch '^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$') { throw "Invalid $field" }
    }
    if ($Profile.environmentName -cne $Profile.target) { throw 'Target/environment mismatch' }
    $root = [IO.Path]::GetFullPath($VaultRoot).TrimEnd('\')
    if (!$Synthetic -and $root -cne 'R:\CredoNomics-recovery') { throw 'Only mounted R:\CredoNomics-recovery is permitted' }
    if (!(Test-Path -LiteralPath (Split-Path -Qualifier $root))) { throw 'Vault not mounted' }
    Assert-NoLinks $root; Assert-NoLinks $KnownHosts
    if (!(Test-Path -LiteralPath $KnownHosts -PathType Leaf)) { throw 'Verified known_hosts required' }
    $version = Invoke-Checked $Runner railway @('--version')
    if ($version.Trim() -ne 'railway 5.70.0') { throw 'Unreviewed Railway CLI version' }
    $statusArgs = @('status','--project',$Profile.projectId,'--environment',$Profile.environmentId,'--json')
    $status = (Invoke-Checked $Runner railway $statusArgs) | ConvertFrom-Json
    Assert-Identity $Profile $status
    # Resolve the target with Railway itself; never infer a service/domain username.
    $configArgs = @('ssh','config','--project',$Profile.projectId,'--environment',$Profile.environmentId,'--service',$Profile.serviceId,'--dry-run')
    $config = Invoke-Checked $Runner railway $configArgs
    if ($config -cnotmatch '(?m)^\s*HostName ssh\.railway\.com\s*$' -or
        $config -cnotmatch ('(?m)^\s*User ' + [regex]::Escape($Profile.serviceInstanceId) + '\s*$')) { throw 'SSH resolution mismatch' }
    $identity = ConvertTo-Json -InputObject $Profile -Compress
    $parent = Join-Path $root $Profile.target
    $destination = Join-Path $parent $BackupId
    Assert-NoLinks $destination
    if (Test-Path -LiteralPath $destination) {
        $saved = Get-Content -LiteralPath (Join-Path $destination 'complete.json') -Raw | ConvertFrom-Json
        if ($saved.identity -cne $identity -or $saved.inventory -cne (Get-LocalInventory (Join-Path $destination 'payload'))) { throw 'Existing backup identity/integrity mismatch' }
        return 'Already complete; hashes verified'
    }
    [IO.Directory]::CreateDirectory($parent) | Out-Null
    # A failed attempt is never resumed into or overwritten. Retry uses a fresh sibling.
    $attempt = Join-Path $parent ($BackupId + '.partial-' + [guid]::NewGuid().ToString('N'))
    [IO.Directory]::CreateDirectory($attempt) | Out-Null
    $lock = $null
    try {
        $lock = [IO.File]::Open((Join-Path $parent ($BackupId + '.lock')), 'OpenOrCreate', 'ReadWrite', 'None')
        Write-NewJson (Join-Path $attempt 'identity.json') $Profile
        $remote = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'remote-inventory.cjs') -Raw
        $remote += "`ninventory($identity).then(x=>process.stdout.write(JSON.stringify(x))).catch(()=>{process.stderr.write('Inventory refused');process.exitCode=1});"
        $encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($remote))
        # No embedded double quotes: Windows PowerShell 5.1's native argv marshaller
        # otherwise strips them before ssh reaches the remote POSIX shell.
        $remoteCommand = "node -e eval\(Buffer.from\(\'$encoded\',\'base64\'\).toString\(\)\)"
        $target = $Profile.serviceInstanceId + '@ssh.railway.com'
        $pinnedHosts = Join-Path $attempt 'known_hosts'
        [IO.File]::Copy([IO.Path]::GetFullPath($KnownHosts), $pinnedHosts, $false)
        $sshConfig = Join-Path $attempt 'ssh.conf'
        if ($pinnedHosts -match '["\r\n]') { throw 'Unsafe trust store path' }
        [IO.File]::WriteAllText($sshConfig, ("Host *`n    UserKnownHostsFile """ + $pinnedHosts.Replace('\','/') + """`n"), [Text.UTF8Encoding]::new($false))
        $sshOptions = @('-F',$sshConfig,'-o','BatchMode=yes','-o','StrictHostKeyChecking=yes','-o','ConnectTimeout=20','-o','ServerAliveInterval=15','-o','ServerAliveCountMax=3')
        $before = Get-CanonicalInventory ((Invoke-Checked $Runner ssh ($sshOptions + @($target,$remoteCommand))) | ConvertFrom-Json)
        Write-NewJson (Join-Path $attempt 'remote-before.json') ($before | ConvertFrom-Json)
        $payload = Join-Path $attempt 'payload'
        $batch = Join-Path $attempt 'transfer.sftp'
        # Local path is generated, validated, and quoted for SFTP's command parser.
        if ($payload -match '["\r\n]') { throw 'Unsafe local path' }
        [IO.File]::WriteAllText($batch, ('get -R "/data" "' + $payload.Replace('\','/') + '"' + "`n"), [Text.UTF8Encoding]::new($false))
        $null = Invoke-Checked $Runner sftp ($sshOptions + @('-b',$batch,$target))
        if (!(Test-Path -LiteralPath $payload -PathType Container)) { throw 'Missing downloaded payload' }
        $after = Get-CanonicalInventory ((Invoke-Checked $Runner ssh ($sshOptions + @($target,$remoteCommand))) | ConvertFrom-Json)
        $local = Get-LocalInventory $payload
        Write-NewJson (Join-Path $attempt 'remote-after.json') ($after | ConvertFrom-Json)
        Write-NewJson (Join-Path $attempt 'inventory-sha256.json') ($local | ConvertFrom-Json)
        if ($before -cne $after -or $before -cne $local) { throw 'Inventory/hash mismatch or remote changed; retry in new attempt' }
        Assert-Identity $Profile ((Invoke-Checked $Runner railway $statusArgs) | ConvertFrom-Json)
        Write-NewJson (Join-Path $attempt 'complete.json') ([ordered]@{ identity = $identity; inventory = $local; completedUtc = [DateTime]::UtcNow.ToString('o'); consistency = 'File-copy verified; application recovery must be tested separately' })
        if (Test-Path -LiteralPath $destination) { throw 'Destination appeared; refusing overwrite' }
        [IO.Directory]::Move($attempt,$destination)
        return 'Complete; remote/local SHA-256 inventories match'
    } finally { if ($null -ne $lock) { $lock.Dispose() } }
}
Export-ModuleMember -Function Invoke-CNVolumeBackup

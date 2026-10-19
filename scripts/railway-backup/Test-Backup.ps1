#requires -Version 5.1
# Pure synthetic fixtures. No network, Railway account, private keys or mounted vault.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Import-Module (Join-Path $PSScriptRoot 'Backup.Core.psm1') -Force
$root = Join-Path ([IO.Path]::GetTempPath()) ('cn-backup-synthetic-' + [guid]::NewGuid().ToString('N'))
[IO.Directory]::CreateDirectory($root) | Out-Null
$known = Join-Path $root 'known_hosts'; [IO.File]::WriteAllText($known,'SYNTHETIC')
$p = [pscustomobject][ordered]@{ target='staging'; projectId='11111111-1111-4111-8111-111111111111'; projectName='synthetic';
    environmentId='22222222-2222-4222-8222-222222222222'; environmentName='staging';
    serviceId='33333333-3333-4333-8333-333333333333'; serviceName='synthetic-service';
    serviceInstanceId='44444444-4444-4444-8444-444444444444'; volumeId='55555555-5555-4555-8555-555555555555'; volumeName='synthetic-data' }
$script:mode = 'ok'; $script:transfers = 0; $script:sshCalls = 0
$runner = {
    param($program,$arguments)
    $out = ''; $code = 0
    switch ($program) {
        railway {
            if ($arguments[0] -eq '--version') { $out = 'railway 5.70.0' }
            elseif ($arguments[0] -eq 'ssh') { $out = "Host synthetic`n HostName ssh.railway.com`n User $($p.serviceInstanceId)`n" }
            else {
                $sid = $p.serviceId; if ($script:mode -eq 'wrong-volume') { $sid = $p.projectId }
                $status = @{ id=$p.projectId; name=$p.projectName; services=@{edges=@(@{node=@{id=$p.serviceId;name=$p.serviceName}})};
                    environments=@{edges=@(@{node=@{id=$p.environmentId;name=$p.environmentName;
                        serviceInstances=@{edges=@(@{node=@{id=$p.serviceInstanceId;serviceId=$p.serviceId;environmentId=$p.environmentId}})};
                        volumeInstances=@{edges=@(@{node=@{volume=@{id=$p.volumeId;name=$p.volumeName};serviceId=$sid;environmentId=$p.environmentId;mountPath='/data';isPendingDeletion=$false;deletedAt=$null}})} }})} }
                if ($script:mode -eq 'wrong-project') { $status.id = $p.volumeId }
                $out = ConvertTo-Json $status -Depth 20
            }
        }
        ssh {
            $script:sshCalls++
            $sha = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
            if ($script:mode -eq 'remote-change' -and $script:sshCalls % 2 -eq 0) { $sha = 'a' * 64 }
            $out = ConvertTo-Json -InputObject @(@{path='empty.txt';kind='file';size=0;sha256=$sha},@{path='empty-dir';kind='directory';size=0;sha256=$null})
        }
        sftp {
            $script:transfers++
            if ($script:mode -eq 'transfer-fail') { $code = 23; break }
            $batch = $arguments[[array]::IndexOf($arguments,'-b') + 1]
            $text = [IO.File]::ReadAllText($batch)
            if ($text -notmatch 'get -R "/data" "([^"]+)"') { throw 'Unexpected SFTP command' }
            $payload = $Matches[1]; [IO.Directory]::CreateDirectory($payload) | Out-Null
            [IO.Directory]::CreateDirectory((Join-Path $payload 'empty-dir')) | Out-Null
            [IO.File]::WriteAllBytes((Join-Path $payload 'empty.txt'), [byte[]]@())
            if ($script:mode -eq 'corrupt') { [IO.File]::WriteAllText((Join-Path $payload 'empty.txt'),'corrupt') }
        }
        default { throw 'Unexpected external command' }
    }
    [pscustomobject]@{ ExitCode=$code; Output=$out }
}
$script:passed = 0
function Run([string]$Name, [scriptblock]$Body) { & $Body; $script:passed++; Write-Output "PASS $Name" }
function Backup([string]$Id) { Invoke-CNVolumeBackup -Profile $p -VaultRoot $root -BackupId $Id -Runner $runner -KnownHosts $known -Synthetic }
function Refused([scriptblock]$Body) { $rejected=$false; try { & $Body | Out-Null } catch { $rejected=$true }; if (!$rejected) { throw 'Expected refusal' } }
try {
    Run 'successful inventory + SHA256 + empty directory' { Backup 'good' | Out-Null; if (!(Test-Path (Join-Path $root 'staging/good/complete.json'))) { throw 'Missing completion' } }
    Run 'idempotent recheck without download' { $n=$script:transfers; Backup 'good' | Out-Null; if ($script:transfers -ne $n) { throw 'Unexpected transfer' } }
    Run 'tampered complete backup refused' { [IO.File]::WriteAllText((Join-Path $root 'staging/good/payload/empty.txt'),'tampered'); Refused { Backup 'good' } }
    Run 'remote project mismatch before transfer' { $script:mode='wrong-project'; Refused { Backup 'project' } }
    Run 'remote volume attachment mismatch' { $script:mode='wrong-volume'; Refused { Backup 'volume' } }
    Run 'native nonzero exit leaves incomplete attempt' { $script:mode='transfer-fail'; Refused { Backup 'retry' }; if (Test-Path (Join-Path $root 'staging/retry')) { throw 'Published failure' } }
    Run 'clean retry uses fresh attempt preserving previous failure' { $script:mode='ok'; Backup 'retry' | Out-Null; if (@(Get-ChildItem (Join-Path $root 'staging') -Filter 'retry.partial-*').Count -ne 1) { throw 'Failed attempt not preserved' } }
    Run 'corrupt transfer fails hash comparison' { $script:mode='corrupt'; Refused { Backup 'corrupt' } }
    Run 'remote writes invalidate copy' { $script:mode='remote-change'; $script:sshCalls=0; Refused { Backup 'change' } }
    Run 'path traversal refused' { $script:mode='ok'; Refused { Backup '../escape' } }
    Run 'target environment mismatch refused' { $p.target='production'; Refused { Backup 'mixed' }; $p.target='staging' }
    Run 'production separate destination' { $p.target='production'; $p.environmentName='production'; Backup 'prod' | Out-Null; if (!(Test-Path (Join-Path $root 'production/prod/complete.json'))) { throw 'Wrong destination' }; $p.target='staging'; $p.environmentName='staging' }
    Run 'missing known_hosts refused' { Refused { Invoke-CNVolumeBackup -Profile $p -VaultRoot $root -BackupId 'nohost' -Runner $runner -KnownHosts (Join-Path $root 'absent') -Synthetic } }
    Write-Output "$script:passed synthetic backup tests passed"
} finally {
    # Resolve and bound this one synthetic UUID directory before native PowerShell cleanup.
    $resolved = [IO.Path]::GetFullPath($root)
    $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\') + '\'
    if (!$resolved.StartsWith($tempRoot,[StringComparison]::OrdinalIgnoreCase) -or (Split-Path $resolved -Leaf) -notmatch '^cn-backup-synthetic-[a-f0-9]{32}$') { throw 'Unsafe synthetic cleanup target' }
    Remove-Item -LiteralPath $resolved -Recurse -Force
}

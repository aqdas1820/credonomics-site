#requires -Version 5.1
# Real Windows OpenSSH client -> local Git SFTP server over pipes (-D).
# No TCP connection, agent, private key, passphrase or Railway account is used.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$root = Join-Path ([IO.Path]::GetTempPath()) ('cn-sftp-native-' + [guid]::NewGuid().ToString('N'))
$savedPath = $env:PATH
try {
    $gitRoot = Join-Path $env:ProgramFiles 'Git'
    $server = Join-Path $gitRoot 'usr/lib/ssh/sftp-server.exe'
    $shortServer = (New-Object -ComObject Scripting.FileSystemObject).GetFile($server).ShortPath
    if ($shortServer -match '\s') { throw 'Fixture requires a space-free short path for the local SFTP server' }
    $env:PATH = (Join-Path $gitRoot 'usr/bin') + ';' + $savedPath # Git server DLL discovery, process-local only.
    $source = Join-Path $root 'source'
    [IO.Directory]::CreateDirectory((Join-Path $source 'empty-dir')) | Out-Null
    [IO.Directory]::CreateDirectory((Join-Path $source 'nested')) | Out-Null
    [IO.File]::WriteAllBytes((Join-Path $source '.hidden'), [byte[]]@(0,1,255))
    [IO.File]::WriteAllText((Join-Path $source 'nested/spaces in name.txt'), 'SYNTHETIC ONLY')
    [IO.File]::WriteAllBytes((Join-Path $source 'zero.txt'), [byte[]]@())
    $remote = '/' + $source.Substring(0,1).ToLowerInvariant() + $source.Substring(2).Replace('\','/')
    $payload = Join-Path $root 'payload'
    $batch = Join-Path $root 'batch'
    [IO.File]::WriteAllText($batch, ('get -R "' + $remote + '" "' + $payload.Replace('\','/') + '"' + "`n"), [Text.UTF8Encoding]::new($false))
    $native = Join-Path $env:WINDIR 'System32/OpenSSH/sftp.exe'
    & $native -D $shortServer -b $batch | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Native SFTP fixture transfer failed' }
    foreach ($name in @('.hidden','nested/spaces in name.txt','zero.txt')) {
        $a = (Get-FileHash -LiteralPath (Join-Path $source $name) -Algorithm SHA256).Hash
        $b = (Get-FileHash -LiteralPath (Join-Path $payload $name) -Algorithm SHA256).Hash
        if ($a -cne $b) { throw 'Native SFTP fixture hash mismatch' }
    }
    if (!(Test-Path -LiteralPath (Join-Path $payload 'empty-dir') -PathType Container) -or
        @(Get-ChildItem -LiteralPath $payload -Force -Recurse).Count -ne 5) { throw 'Native SFTP fixture inventory mismatch' }
    Write-Output 'PASS real native Windows SFTP batch: exact destination, hidden/binary/empty files, spaced names, empty directory, SHA-256'
} finally {
    $env:PATH = $savedPath
    $resolved = [IO.Path]::GetFullPath($root)
    $tempRoot = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd('\') + '\'
    if (!$resolved.StartsWith($tempRoot,[StringComparison]::OrdinalIgnoreCase) -or
        (Split-Path $resolved -Leaf) -notmatch '^cn-sftp-native-[a-f0-9]{32}$') { throw 'Unsafe synthetic cleanup target' }
    if (Test-Path -LiteralPath $resolved) { Remove-Item -LiteralPath $resolved -Recurse -Force }
}

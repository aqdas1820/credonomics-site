# Windows current-user DPAPI protects the local TEST ledger key. Invoked privately by Node.
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Security
$root=Join-Path $env:LOCALAPPDATA 'CredoNomics/personal-testing'
$cursor=$root
while($cursor){if(Test-Path -LiteralPath $cursor){if((Get-Item -LiteralPath $cursor -Force).Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'Linked key directory refused'}};$parent=Split-Path $cursor -Parent;if($parent -eq $cursor){break};$cursor=$parent}
$owner=[Security.Principal.WindowsIdentity]::GetCurrent().User
if(!(Test-Path -LiteralPath $root)){
  [IO.Directory]::CreateDirectory($root)|Out-Null
  $acl=New-Object Security.AccessControl.DirectorySecurity
  $acl.SetOwner($owner);$acl.SetAccessRuleProtection($true,$false)
  foreach($sid in @($owner,[Security.Principal.SecurityIdentifier]::new('S-1-5-18'))){$acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new($sid,'FullControl','ContainerInherit,ObjectInherit','None','Allow'))}
  Set-Acl -LiteralPath $root -AclObject $acl
}
if((Get-Acl -LiteralPath $root).GetOwner([Security.Principal.SecurityIdentifier]).Value -ne $owner.Value){throw 'Wrong local key owner'}
$path=Join-Path $root 'ledger-key.dpapi'
$entropy=[Text.Encoding]::UTF8.GetBytes('CredoNomics personal TEST ledger v1')
if(Test-Path -LiteralPath $path){
  if((Get-Item -LiteralPath $path -Force).Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'Linked key file refused'}
  $key=[Security.Cryptography.ProtectedData]::Unprotect([IO.File]::ReadAllBytes($path),$entropy,[Security.Cryptography.DataProtectionScope]::CurrentUser)
}else{
  $key=New-Object byte[] 32;$rng=[Security.Cryptography.RandomNumberGenerator]::Create();try{$rng.GetBytes($key)}finally{$rng.Dispose()}
  $protected=[Security.Cryptography.ProtectedData]::Protect($key,$entropy,[Security.Cryptography.DataProtectionScope]::CurrentUser)
  $stream=[IO.File]::Open($path,'CreateNew','Write','None');try{$stream.Write($protected,0,$protected.Length);$stream.Flush($true)}finally{$stream.Dispose()}
}
if($key.Length -ne 32){throw 'Invalid local key'}
# stdout is captured in memory by the launcher, never forwarded to its terminal.
[Console]::Out.Write(([BitConverter]::ToString($key).Replace('-','').ToLowerInvariant()))
[Array]::Clear($key,0,$key.Length)

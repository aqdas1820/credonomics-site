# Railway volume export to the encrypted Windows vault

Reviewed 2026-10-19. Use Windows PowerShell 5.1 or later, Railway **5.70.0**, native
Windows OpenSSH 9.5+, and an already mounted VeraCrypt **R:**. This is an operator
procedure: do not run it in CI. No backup, manifest, token, private key, session,
or private profile belongs in GitHub, chat, browser traces, or Actions artifacts.

## Why the failing command fails

Exact Railway tag `v5.70.0` resolves to commit
`5ba0b00c62d7fd5cdade53f0c3869ed4ba1de2e1` (annotated tag object
`87f9bad989f1a65916bb9d7fbbc9cdc9bc439fb9`).

- [Authentication implementation](https://github.com/railwayapp/cli/blob/5ba0b00c62d7fd5cdade53f0c3869ed4ba1de2e1/src/controllers/ssh/authentication.rs):
  encrypted file loading first tries no passphrase. On failure it prompts only
  when stdin is a terminal **and** `telemetry::is_agent()` is false. Otherwise the
  key is skipped; when no key can be attempted it reports the observed errors.
- [Agent implementation](https://github.com/railwayapp/cli/blob/5ba0b00c62d7fd5cdade53f0c3869ed4ba1de2e1/src/controllers/ssh/keys.rs):
  Unix connects through `SSH_AUTH_SOCK`; Windows connects to **Pageant**, not the
  Windows OpenSSH named-pipe agent. Simply running Windows `ssh-add` does not fix
  Railway's embedded SFTP client. A compatible Pageant session is a source-supported
  option, but was not installed or tested in this phase.
- [File commands](https://github.com/railwayapp/cli/blob/5ba0b00c62d7fd5cdade53f0c3869ed4ba1de2e1/src/commands/volume/files.rs)
  and [SFTP](https://github.com/railwayapp/cli/blob/5ba0b00c62d7fd5cdade53f0c3869ed4ba1de2e1/src/commands/volume/sftp.rs):
  list and download share that authentication code. There is no download-only
  passphrase restriction and `--concurrency 1` does not change authentication.
  A fresh owner terminal can prompt for either command. A previous listing's
  passphrase is not cached across CLI processes. The evidence is consistent with
  terminal/agent-context differences; the original failing process environment
  was not captured, so that specific trigger is not proven.
- `browse` uses the same embedded connection. Its observed loading hang is not
  diagnosed by this error alone; no live reproduction was attempted. Exit it
  with Ctrl+C and use explicit commands rather than waiting indefinitely.

Correct version-checked syntax (use IDs, with options at their owning groups):

```powershell
railway volume --project $ProjectId --environment $EnvironmentId --service $ServiceId files --volume $VolumeId download / 'R:\CredoNomics-recovery\staging\new-cli-copy' --concurrency 1 --json
if ($LASTEXITCODE -ne 0) { throw 'Railway download failed' }
```

The destination must not exist. `/` here means the volume root; the supported
native alternative below addresses the mounted container path `/data`.
Do not use `--overwrite`. Never adopt the CLI error's unprotected-key suggestion.
Official [volume syntax](https://docs.railway.com/cli/volume) and
[OpenSSH/SFTP support](https://docs.railway.com/cli/ssh#copy-files-with-scp-and-sftp).

## One-time operator prerequisites

1. Confirm VeraCrypt shows the intended existing vault mounted as R:, with enough
   free space for a complete copy plus retained partial attempts. Verify physical
   custody and Windows account permissions. The tool checks the drive/path and
   rejects reparse points; it cannot cryptographically establish that a drive is
   VeraCrypt, so `-VaultConfirmed` is an operator attestation. Use a private local
   terminal without transcripts or screen sharing. Do not unmount R: during export.
2. Check Railway account/project/environment identities against the dashboard.
   Confirm remaining included allowance covers **egress and hash CPU**, with no
   incremental charge, before `-ZeroAdditionalCostConfirmed`. Railway transfer
   is not automatically free: [current pricing](https://railway.com/pricing).
   If zero incremental cost cannot be established, stop before remote reads.
   Do not enable paid backups, add resources, or upgrade a plan.
3. An approved consistent backup window requires all `/data` writers quiesced:
   OAuth callback, token notifier, scheduler, background jobs and any database
   writer. Quiescing/restarting infrastructure requires separate owner action;
   this tool does neither. Without a safe window, do not attest
   `-WritersQuiesced`. File hashes are not a database transaction snapshot.
4. On this machine `Get-Service ssh-agent` returned **Stopped / Disabled**.
   An operator who approves local agent setup can run this in an elevated terminal:

   ```powershell
   Set-Service ssh-agent -StartupType Manual
   Start-Service ssh-agent
   ```

   Then in the owner's normal terminal, unlock the **existing encrypted key**:

   ```powershell
   ssh-add "$env:USERPROFILE\.ssh\id_ed25519"
   if ($LASTEXITCODE -ne 0) { throw 'Key unlock failed' }
   ssh-add -l
   if ($LASTEXITCODE -ne 0) { throw 'No usable agent identity' }
   ```

   Substitute the existing registered key's actual path if different. Enter its
   passphrase only in the OpenSSH prompt. No passphrase argument, environment
   variable, script storage or key conversion. [Microsoft agent documentation](https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_keymanagement).
   Native OpenSSH uses its own agent; Railway metadata calls need no private key.

## Discover identities separately for each environment

Do staging first. Populate variables from the dashboard, never from assumed names
or a linked default. `surprising-mercy` is the owner-reported staging service;
no production identity was supplied or inferred.

```powershell
$ProjectId = '<dashboard project UUID>'
$EnvironmentId = '<staging environment UUID>'
$ServiceId = '<staging service UUID>'
railway --version
railway status --project $ProjectId --environment $EnvironmentId --json
if ($LASTEXITCODE -ne 0) { throw 'Identity discovery failed' }
railway volume --project $ProjectId --environment $EnvironmentId --service $ServiceId list --json
if ($LASTEXITCODE -ne 0) { throw 'Volume discovery failed' }
railway ssh config --project $ProjectId --environment $EnvironmentId --service $ServiceId --dry-run
if ($LASTEXITCODE -ne 0) { throw 'SSH target discovery failed' }
```

Inspect output privately. In `status`, use `environments.edges[].node` and its
`serviceInstances.edges[].node` / `volumeInstances.edges[].node`. Record exact
IDs and names. Confirm the volume is attached to the exact service/environment,
mounted at `/data`, and not pending deletion. `ssh config --dry-run` must name
`ssh.railway.com` and the same **service instance ID** as `User`. A service ID is
not a service instance ID. Do not invent a domain or use a staging instance for
production. Do not save full `status` deployment metadata in a public report.

Create `R:\CredoNomics-recovery\profiles\staging.json` privately using this shape
(all values below are placeholders, not real identity evidence):

```json
{
  "target": "staging",
  "projectId": "<UUID>", "projectName": "<exact name>",
  "environmentId": "<UUID>", "environmentName": "staging",
  "serviceId": "<UUID>", "serviceName": "<exact name>",
  "serviceInstanceId": "<UUID>",
  "volumeId": "<UUID>", "volumeName": "<exact name>"
}
```

Only environments literally named `staging` and `production` are accepted; if
the dashboard differs, stop and review the profile/tool contract rather than
mislabeling it. The tool re-reads metadata before and after copying and validates
remote runtime project/environment/service IDs and volume mount path.

## Verify host trust and perform the export

Use `$ServiceInstanceId` copied from the verified generated block. Railway
documents `<service-instance-id>@ssh.railway.com`; that hostname is official.

```powershell
$ServiceInstanceId = '<verified service instance UUID>'
$SshTarget = $ServiceInstanceId + '@ssh.railway.com'
$KnownHosts = "$env:USERPROFILE\.ssh\known_hosts"
ssh -o StrictHostKeyChecking=ask -- $SshTarget true
if ($LASTEXITCODE -ne 0) { throw 'SSH trust/authentication check failed' }
```

If a host key is first seen or has changed, independently verify its fingerprint
through Railway's trusted support/channel before accepting it. Do not blindly
approve it, use `ssh-keyscan` as proof, erase a mismatch, or disable verification.
The tool requires existing trust and uses `StrictHostKeyChecking=yes`.

From the repository directory:

```powershell
powershell -NoProfile -File scripts/railway-backup/Backup-RailwayVolume.ps1 `
  -Target staging -ProfilePath 'R:\CredoNomics-recovery\profiles\staging.json' `
  -BackupId '2026-10-19-staging-01' -KnownHosts $KnownHosts `
  -VaultConfirmed -ZeroAdditionalCostConfirmed -WritersQuiesced
if ($LASTEXITCODE -ne 0) { throw 'Backup incomplete; preserve partial attempt' }
```

Successful output is under
`R:\CredoNomics-recovery\staging\2026-10-19-staging-01\`:
`payload`, identity, remote before/after inventories, per-file SHA-256 inventory,
pinned public host trust, transfer batch, and `complete.json`. The SSH config is
isolated from user config and contains no key material. No file contents print.
The remote helper requires Node and access to `/data`; a missing runtime or
permission fails closed. Symlinks, special files and Windows-incompatible names
are refused rather than silently omitted. Unix ownership/permissions are not
preserved as a restorable filesystem image; inventory certifies file bytes and
directory paths only. It cannot back up Supabase DB/Storage or encryption keys.

Re-running the same ID verifies the complete payload hashes and does not download
again. A failed attempt remains `.partial-<UUID>`; re-run the same command for a
fresh clean attempt. No partial is merged, reused or deleted. Check capacity
before retrying. Do not manually rename a partial to a successful backup. The
empty `.lock` file is harmless; an OS file lock controls concurrent writers.

For production, repeat discovery against the production environment and create
an independent `production.json` with `target` and `environmentName` both
`production`. Confirm production's backup window and cost separately. Then run:

```powershell
powershell -NoProfile -File scripts/railway-backup/Backup-RailwayVolume.ps1 `
  -Target production -ProfilePath 'R:\CredoNomics-recovery\profiles\production.json' `
  -BackupId '2026-10-19-production-01' -KnownHosts $KnownHosts `
  -VaultConfirmed -ZeroAdditionalCostConfirmed -WritersQuiesced
if ($LASTEXITCODE -ne 0) { throw 'Production backup incomplete' }
```

## Manual supported fallback and recovery acceptance

If the embedded Railway client still fails, native SFTP is the supported path
used by the tool. For manual diagnosis, after all preceding identity/trust/cost
checks, create a **fresh** directory on R: and run `sftp $SshTarget`. At its prompt:

```text
ls -la /data
get -R /data R:/CredoNomics-recovery/staging/manual-fresh-01/payload
bye
```

The manual directory must not contain a previous payload. Native SFTP may
overwrite existing files, so use only a new directory. A manual copy alone has
**not** passed the tool's inventory or consistency validation. Use a new tool
attempt to obtain certification; do not claim recovery readiness from `ls` or a
transfer exit alone. If native SSH/SFTP also fails, retain the existing volume
and contact Railway with version, OS, sanitized error and public-key fingerprint
only. No invented SCP gateway, paid snapshot, HTTP token export or key weakening.

Before calling recovery verified: privately restore into a separate encrypted
scratch directory, rehash every file against the retained manifest, check no
missing/extra files, and test application startup/read behavior **offline** with
network/provider calls disabled and synthetic records. Recover keys separately
through approved custody. Do not start a backend with backed-up live tokens
against Upstox. Operator-only live restore/reconciliation needs its own approval.
No live restore was performed here. Remove only the specific key from the agent
after the window (`ssh-add -d <existing-key-path>`) if appropriate; never `-D`
against unrelated identities. Confirm the vault is safely dismounted afterward.

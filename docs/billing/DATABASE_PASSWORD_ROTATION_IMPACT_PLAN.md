# Staging database password rotation impact plan — NOT AUTHORIZED / NOT EXECUTED

2026-10-18. Exact project: `credonomics-staging`, `jvpiulmcjjnsgozgqgzw`.
Additional spend ceiling: INR 0. This document grants no reset, user creation,
permission change, migration, deployment or production access approval.

Existing export password remains unavailable. Keep backup/restore blocked. The
owner must choose between privately recovering an existing authorized credential
and a separately approved controlled rotation. Do not interpret a request for a
plan as permission to reset. [Official PostgreSQL role guidance](https://supabase.com/docs/guides/database/postgres/roles),
[connection methods](https://supabase.com/docs/guides/database/connecting-to-postgres).

## Impact inventory before requesting an execution window

The owner/operator must inventory **consumers, locations and responsible owners**,
never credential values. No inventory of private stores was performed by this task.

| Consumer | Expected impact / required action |
| --- | --- |
| Direct PostgreSQL sessions and shared session pooler | New authentication with the old database password can fail. Inventory desktop clients, tools, scripts and connection pools; plan controlled reconnects. Existing sessions must not be assumed revoked merely by changing a password. |
| CLI, local export tools, pgpass/service files | Replace only the authorized exact-project entry privately on encrypted storage; enforce precise host/port/database/user binding, ACLs and TLS verification. No secrets in arguments, history or reports. |
| CI/CD, scheduled jobs, linked integrations | Identify any direct-database secret references without reading/printing values. Pause affected jobs with separate authorization and assign private updates to their owners. Never put staging exports into GitHub Actions. |
| App using Supabase HTTP APIs / Auth / Storage | A PostgreSQL password is distinct from a service-role/API key, Auth user's password or JWT signing key. Do not rotate unrelated secrets automatically. Confirm actual architecture and provider-managed connections; do not assume either universal outage or universal immunity. |
| Runtime using a database URL | Requires a separately approved runtime secret update/restart if it embeds the changed password. No production environment edit or deployment is authorized here. |
| Recovery and rollback | There is no verified database backup and no known old password. Document this risk before approval. Do not promise rollback to an unavailable credential. Prefer a controlled forward fix using the new authorized credential; another reset is another explicit owner decision. |

## Concrete execution plan for a later, separately approved operator

1. Confirm exact project/name/organization/Free status again and verify operator
   role. Record non-sensitive inventory completion and a no-cost maintenance window.
   Keep all billing/payment/OTP flags off. Inventory non-billing dependents too.
2. Privately generate/store the replacement credential in an existing owner vault;
   independently recover its encrypted copy. Arrange dependent-owner updates before
   changing anything. Do not send a credential to this agent/chat.
3. Obtain explicit owner approval naming the exact reference, PostgreSQL role,
   reset action, expected reconnect interruption, dependent secret updates,
   authorized operator, execution window and contingency. Approval for backup,
   VeraCrypt setup or this plan is insufficient. Stop if dependencies are unknown.
4. Only the approved operator would use the official dashboard reset mechanism
   privately. Do not create a new role, broaden grants, disable network controls,
   purchase IPv4, create a branch/project or run SQL migrations as a workaround.
5. Update inventoried consumers privately and reconnect as needed. Verify the new
   connection with certificate/hostname validation, exact-project binding and
   non-mutating queries; verify sufficient export access without dumping data.
   Test expected old-password denial using an approved controlled method that
   does not expose it. Report booleans and exit codes only.
6. Check affected application health without live payments/customer messages.
   Do not replace unrelated API/JWT/OTP/YouPI keys to resolve an unrelated error.
   If a critical dependent fails, hold feature activation and follow the agreed
   forward-recovery procedure; never improvise another reset or production deploy.
7. Only after separate backup preflight passes may the authorized private logical
   backup/local restore proceed. Keep migrations 012–016 blocked until tested
   recovery, reviewed rollback and separate exact-ref migration approval.

## Stop criteria and audit record

Stop for wrong project, unknown dependents, missing explicit approval, insecure
secret destination, unavailable independent recovery, unplanned spend, excessive
permissions or failure to reconnect. No hard-coded downtime or automatic session
revocation guarantee is made. Audit only timestamp, exact project, responsible
operator role, approved action reference, affected consumer categories, sanitized
connection/health outcomes and next blockers. Never store credentials or customer
records in this document. **Execution status: NOT RUN.**

# Phase 28 read-only DNS migration verification

Run on Windows PowerShell with the project's Node.js installation. No API key, DNS write, provider login, purchase, nameserver update, or deployment is needed.

```powershell
New-Item -ItemType Directory -Path artifacts -Force | Out-Null
node scripts/dns/verify-migration.mjs --output artifacts/dns-before.local.json
# Only AFTER a separately authorized nameserver migration, run:
node scripts/dns/verify-migration.mjs --before artifacts/dns-before.local.json --output artifacts/dns-after.local.json
# Repeat with an independent recursive resolver:
node scripts/dns/verify-migration.mjs --server 1.1.1.1 --before artifacts/dns-before.local.json --output artifacts/dns-after-cloudflare.local.json
node --test scripts/dns/verify-migration.test.mjs
```

Output files are exclusive-create: choose a new filename for each observation. The `artifacts/` directory is ignored by Git. Exit codes: 0 = all checks PASS, 1 = at least one FAIL or an execution error, 2 = WARN without FAIL. Differences from a baseline are WARN, because delegation and legitimate target changes require review. An unchanged fingerprint does not turn an absent/failed answer into a configuration PASS.

The default `scripts/dns/expected.pending.redacted.json` was captured through **GET-only Cloudflare API reads** on 2026-10-19. It independently confirms a **pending** zone with **12 custom records**: apex A, four CNAMEs (including `_domainconnect`), two MX records, two Google verification TXT records, SPF, DMARC, and Railway verification TXT. Every record was DNS-only (`proxied=false`). The expected future Cloudflare nameservers are separate from those 12 records. TXT contents were hashed inside the read-only connector before returning results; their values were never printed or committed.

On 2026-10-19 both the default resolver and `1.1.1.1` matched all ten custom-record comparison groups. **NS comparison FAIL is expected before migration**: public delegation does not yet match the pending zone's assigned nameservers. This confirms agreement between the current public answers and the saved pending configuration; it does **not** prove that the pending zone serves public traffic. No nameserver migration occurred during Phase 28. The two live observations were collected minutes apart before any migration; the second is a resolver cross-check, not a post-migration acceptance test.

Use `--config FILE` to supply an updated reviewed manifest. The blank `expected.example.json` is a template: absent expected targets or TXT fingerprints yield WARN rather than false verification. TXT fingerprints are SHA-256 of the entire logical TXT value, joined across DNS chunks, without DNS presentation quotes. Keep the complete set of Google fingerprints; do not combine separate records. The script compares exact record sets, including MX priorities and unwanted extras. It rejects duplicate SPF/DMARC policy records and permissive SPF `+all`/missing terminal policy. This is a structural/preservation check, not a full SPF lookup-budget analysis or a mail-deliverability test.

After separately approved migration, confirm registrar delegation, DNSSEC/DS consistency, TTL expiry and nameservers using independent resolvers. If flattening or proxying is intentionally introduced, exact A/CNAME comparisons may fail; update the reviewed expectation rather than treating a passing lookup as proof of the underlying target. DNS success alone does not prove HTTPS routing, certificate validity, application health, ImprovMX forwarding, or provider verification acceptance. Test those separately without initiating payments or sending customer notifications.

Provider references: [Railway domain/SSL DNS requirements](https://docs.railway.com/networking/troubleshooting/ssl), [ImprovMX record setup](https://www.improvmx.com/guides/bluehost/), [Cloudflare zone status](https://developers.cloudflare.com/dns/zone-setups/reference/domain-status/).

# Backend zero-additional-cost compatibility

Reviewed 2026-10-18, backend `aqdas1820/credonomics-backend` exact HEAD
`3bcfe78e24de1924b2be301ad9c66f887c2bd5ed`. Read-only source clone only: no backend
code changes, service restart, Railway/volume operation, environment inspection,
token-store read, provider API call or cloud provisioning. The runnable prototype
is deliberately in this frontend engineering PR for independent review.

## Exact source dependencies and required redesign

| Dependency | Evidence in backend source | Worker compatibility |
| --- | --- | --- |
| Persistent Node process / Fastify | src/server.ts loads configuration, builds app and calls app.listen; SIGINT/SIGTERM shutdown. src/app.ts installs Fastify CORS/helmet/rate-limit/websocket plugins. | No unchanged persistent listener in fetch-handler model. Rewrite bounded routes around Request/Response; native Node/plugin support alone is not a lifecycle guarantee. |
| Upstox continuous feed | providers/upstox/upstox-feed-client.ts holds ws socket, desired subscriptions, reconnection state and setTimeout backoff; authorizes a wss redirect, decodes protobuf ticks. | Not a drop-in move. Outbound socket/reconnect lifecycle, disconnects, subscriptions and entitlement must be redesigned and tested. No claim of unchanged migration or guaranteed uptime. |
| Client fan-out / shared state | services/market-stream-gateway.ts holds client-to-key and latest-quote Maps, listeners and synced aggregate subscriptions. Upstox provider holds latestQuotes. | Isolate memory is not shared durable coordination. Need a separately costed coordination design; this prototype omits streaming entirely. |
| Caches / timers | cache/in-memory-cache.ts Map with freshness/stale timestamps; GeminiIntelligenceService uses node-cache one-hour TTL; feed has reconnect timer; Upstox HTTP/token requests use bounded timeout. | Request-scoped timeout is portable. Global caches cannot be relied upon for correctness, authorization, OAuth replay protection or distributed rate limiting. |
| Upstox token persistence | providers/upstox/upstox-token-store.ts uses fs mkdir/read/write/rename, restrictive file mode and JSON metadata. | No persistent local disk assumption. Keep existing secure store unchanged; future move needs approved durable encrypted store, access controls, recoverability and atomic/versioned updates. No token copied here. |
| OAuth state / scheduler | controllers/admin-auth-controller.ts has module-global expiring state Map. routes/admin-auth-routes.ts exposes authenticated request-token trigger; middleware/admin-auth.ts separates scheduler/admin secrets. | Replay-safe state must be durable/atomic. No internal recurring scheduler was found in app startup; external trigger configuration is outside source inspection. Cron must call approved operations, not silently bypass human broker approval. |
| External HTTP providers | Upstox HTTP/token service uses fixed API origin; provider-factory selects provider; Yahoo adapter imports yahoo-finance2; Gemini module imports Google SDK. | Fetch-only portions feasible after compatibility, timeout, output-validation and entitlement review. A free hosting allowance does not grant exchange redistribution rights, API credits or provider access. Gemini helper exists in source but was not registered by inspected app.ts; do not infer it is active. |
| Other filesystem / runtime assets | Static instrument JSON import/registry Map, runtime proto assets copied by build; token store is mutable filesystem state. | Bundle static licensed assets if size/CPU allow; do not confuse them with durable mutable disk. Protobuf decode CPU must be measured. |

## Sustainable free-tier boundary

Current [Workers limits](https://developers.cloudflare.com/workers/platform/limits/)
document 100,000 inbound requests/day, 10 ms CPU per HTTP invocation and 128 MB
memory. Network wait is separate from CPU; parsing/crypto/normalization still
consume CPU. A 5-second polling client over 8 hours uses 5,760 requests/day;
17 such clients already use 97,920 requests, excluding health/other traffic.
Caching can reduce provider calls but does not remove inbound quota consumption.
Quota/load measurements and deliberate 429/503 degradation are prerequisites.

[Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
confirms a Free plan; limited KV/D1 and SQLite Durable Objects exist on Free, but
their operation/storage/duration limits need a distinct design. In particular an
always-active durable coordinator is not an unlimited free persistent server.
No Workers, D1, KV, Durable Objects, R2, account upgrade, payment method or resource
was provisioned. No claim that existing Railway service/volume can be deleted.

The technically plausible INR 0 **subset** is a request-scoped read-only snapshot
API within free quotas and existing provider entitlements. Existing frontend
serverless routes may already cover some HTTP needs without another cloud account;
their limits and actual account terms must also be verified. A continuously running
broker feed, durable token rotation and full existing backend parity are **not
proven sustainable at zero additional cost**. Do not replace the backend on this
evidence, and do not present snapshots as live streaming.

## Working offline prototype

`prototypes/worker-market-api/worker.mjs` exports a standards-based fetch handler.
`node --test prototypes/worker-market-api/worker.test.mjs` runs synthetic provider
fixtures with no remote calls. Health is non-sensitive; quote requests require a
separate server-to-server key, explicit enablement and entitlement flags, and a
provider token supplied privately by the eventual operator. No values are created
or configured here. Default behavior is disabled/unavailable.

The prototype permits only one strict NSE equity key, constructs a fixed HTTPS
Upstox URL, rejects redirects/SSRF/duplicate query parameters, bounds response
bytes to 32 KiB, times out at 3 seconds, validates exact returned instrument and
finite non-negative price, and projects only a small snapshot response. It has no
WebSocket, interval, token write, OAuth callback, scheduler or global mutable cache.
It returns `isLive:false`; it is **not** a drop-in replacement for the current
backend's complete routes/envelopes/freshness contract. [Official quote contract](https://upstox.com/developer/api-documentation/get-full-market-quote/).

Before any deployment: verify actual Cloudflare free account limits, approved
provider scopes/redistribution rights and rate caps; add distributed abuse/rate
controls, full instrument registry, freshness/market-session handling, observability
without secrets, token custody, API contract parity and edge-runtime CPU tests.
No Cloudflare runtime or actual provider test was executed; Node Web API fixture
tests prove local handler behavior only. Deployment remains separately approved.

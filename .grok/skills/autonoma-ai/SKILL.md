---
name: autonoma-ai
description: >
  Autonoma AI expert for agentic E2E testing — full Test Planner pipeline (Steps 1–6),
  Environment Factory SDK setup, scenario recipes, Previewkit, and test generation.
  Use when setting up Autonoma, implementing the Environment Factory, generating E2E tests,
  validating scenario lifecycle, configuring Previewkit, or working with AUTONOMA.md,
  features.json, entity-audit, scenarios, or scenario-recipes.json. Triggers on: "autonoma",
  "environment factory", "E2E tests", "test planner", "scenario recipes", "previewkit",
  "AUTONOMA_API_KEY". Use when the user runs /autonoma-ai.
---

# Autonoma AI

Expert guidance for [Autonoma](https://docs.autonoma.app) — agentic end-to-end testing for web, iOS, and Android. Covers the full platform: Test Planner pipeline, Environment Factory SDK, scenario recipes, Previewkit, and E2E test generation.

## Always fetch live docs first

Autonoma docs are LLM-optimized plain text. **Never guess SDK APIs or schemas** — fetch current docs before acting.

```bash
# Index (start here)
curl -sSfL https://docs.autonoma.app/llms.txt

# Fetch a specific page
curl -sSfL https://docs.autonoma.app/llms/<path>.txt

# Full concatenated docs (large — prefer targeted fetches)
curl -sSfL https://docs.autonoma.app/llms-full.txt
```

If `autonoma/.docs-url` exists in the workspace, use it as the base instead of hardcoding URLs.

Key doc paths (append `.txt` to fetch):

| Topic | Path |
|-------|------|
| Introduction | `llms/index.txt` |
| Test Planner overview | `llms/test-planner.txt` |
| Step 1: Knowledge base | `llms/test-planner/step-1-knowledge-base.txt` |
| Step 2: Entity audit | `llms/test-planner/step-2-entity-audit.txt` |
| Step 3: Scenarios | `llms/test-planner/step-3-scenarios.txt` |
| Step 4: Implement factory | `llms/test-planner/step-4-implement.txt` |
| Step 5: Validate lifecycle | `llms/test-planner/step-5-validate.txt` |
| Step 6: E2E tests | `llms/test-planner/step-6-e2e-tests.txt` |
| Environment Factory guide | `llms/guides/environment-factory.txt` |
| Scenario recipe schema | `llms/reference/scenario-recipe-schema.txt` |
| Framework examples | `llms/examples.txt` (+ per-language pages) |
| Previewkit | `llms/previewkit.txt` |
| Previewkit secrets | `llms/previewkit/secrets.txt` |

See `references/llms-index.md` for the full page list.

## Route by user intent

Determine what the user needs, then follow the matching workflow below. If unclear, ask which area they want: full pipeline, factory-only, tests-only, or Previewkit.

| User wants | Start here |
|------------|------------|
| Full setup from scratch | Test Planner Steps 1→6 |
| Environment Factory only | Environment Factory guide + framework example |
| Generate/upload E2E tests | Step 6 (requires Steps 1–5 artifacts) |
| Validate scenarios | Step 5 (requires Step 4 endpoint) |
| PR preview environments | Previewkit docs |
| Framework-specific SDK code | `llms/examples/<language>.txt` |

## Prerequisites

### Environment variables

| Variable | When needed | Purpose |
|----------|-------------|---------|
| `AUTONOMA_API_KEY` | Test Planner, dashboard uploads | API auth |
| `AUTONOMA_PROJECT_ID` | Test Planner | Project scope |
| `AUTONOMA_API_URL` | Test Planner | API base URL |
| `AUTONOMA_SHARED_SECRET` | Environment Factory | HMAC request signing (you + Autonoma) |
| `AUTONOMA_SIGNING_SECRET` | Environment Factory | Signs refs tokens (you only) |

Generate secrets (must be **different** values):

```bash
openssl rand -hex 32   # → AUTONOMA_SHARED_SECRET
openssl rand -hex 32   # → AUTONOMA_SIGNING_SECRET
```

### Codebase access

- **Frontend** — pages, flows, UI patterns (Steps 1, 6)
- **Backend** — entity creation paths, DB layer, auth (Steps 2–5)
- Same monorepo or both repos accessible in workspace

## Test Planner: 6-step pipeline

The Test Planner produces a complete E2E suite plus Environment Factory infrastructure. Each step feeds the next; do not skip validation gates.

```
Step 1: Knowledge base     → autonoma/AUTONOMA.md + features.json
Step 2: Entity audit         → autonoma/entity-audit.md
Step 3: Scenarios            → autonoma/scenarios.md
Step 4: Implement factory    → SDK endpoint + autonoma/.endpoint-implemented
Step 5: Validate lifecycle   → scenario-recipes.json + autonoma/.endpoint-validated
Step 6: E2E tests            → autonoma/qa-tests/ + INDEX.md
```

### Step 1 — Knowledge base

Analyze the **frontend** codebase. Produce:

- `autonoma/AUTONOMA.md` — YAML frontmatter with `app_name`, `app_description`, `core_flows` (2–4 marked `core: true`), `feature_count`
- `autonoma/features.json` — machine-readable feature inventory

**Review checkpoint:** Core flows table — these get 50–60% of test coverage. Wrong core flows = wrong priorities.

### Step 2 — Entity audit

Analyze the **backend** codebase. For every DB model, find the canonical creation function (service/repository). Produce `autonoma/entity-audit.md` with:

- `independently_created: true` — has dedicated creation code → factory must call it
- `independently_created: false` — thin repository call is fine
- `side_effects` — password hashing, slug generation, external APIs, etc.

**Review checkpoint:** Factory vs raw-SQL classification and identified creation functions.

### Step 3 — Scenarios

Design three named environments from schema + audit:

- `standard` — realistic variety for most tests
- `empty` — zero-state testing
- `large` — pagination/performance

Produce `autonoma/scenarios.md` with concrete values, relationships, and `{{token}}` placeholders for variable fields.

**Review checkpoint:** Entity data, counts, relationships, variable field markings.

### Step 4 — Implement Environment Factory

Install the Autonoma SDK in the **existing backend** (never a sidecar). Fetch the Environment Factory guide and the matching framework example before coding.

**Hard rules:**

- SDK language MUST match backend language
- Endpoint lives inside existing app at `/api/autonoma` (conventional path)
- Register a factory for **every** model in entity-audit.md
- For `independently_created: true`: call the audited creation function — **never** inline ORM writes in the factory body
- For `needs_extraction: true`: extract inline creation logic to a named export first
- Run `discover` smoke test; write `autonoma/.endpoint-implemented`
- Does NOT run full up/down — that's Step 5

**Review checkpoint:** SDK packages, endpoint location, every factory wired, auth callback strategy, both secrets listed.

### Step 5 — Validate scenario lifecycle

**Gate step** — Step 6 is blocked until `autonoma/.endpoint-validated` exists.

Against a running dev server, for each scenario:

1. `discover` — all audit models appear in schema
2. `up` — create payload succeeds, auth block is non-empty, refs returned
3. `down` — teardown with refsToken, verify records gone

Iterate up to 5 times fixing handler bugs or reconciling `scenarios.md`.

Then emit `autonoma/scenario-recipes.json` (see Scenario Recipe Schema), run preflight, upload to dashboard at `POST /v1/setup/setups/:id/scenario-recipe-versions`.

**Review checkpoint:** Scenario edits, auth credentials, clean teardown, upload success.

### Step 6 — E2E tests

Generate natural-language test markdown in `autonoma/qa-tests/`:

- Tier 1 (core flows): 50–60% of tests
- Tier 2 (supporting): 25–30%
- Tier 3 (admin/settings): 15–20%

Tests reference scenarios by name (`Using scenario: standard`). Variable fields use `({{token}} variable)` syntax. Include adversarial review. Produce `INDEX.md`.

**Review checkpoint:** Journey tests and critical samples — real UI text, specific assertions, correct variable references.

## Environment Factory essentials

Single POST endpoint with three actions:

| Action | Purpose |
|--------|---------|
| `discover` | Returns schema from factory input schemas |
| `up` | Creates test data + auth credentials before each test |
| `down` | Tears down only what `up` created (signed refsToken) |

### SDK packages by stack

| Backend | Packages |
|---------|----------|
| Next.js / Bun / Deno | `@autonoma-ai/sdk` + `@autonoma-ai/server-web` + `zod` |
| Express / Fastify | `@autonoma-ai/sdk` + `@autonoma-ai/server-express` + `zod` |
| Hono | `@autonoma-ai/sdk` + `@autonoma-ai/server-hono` + `zod` |
| Python | `autonoma-ai` (+ `autonoma_fastapi` / `autonoma_flask` / `autonoma_django`) |
| Go, Rust, Java, Ruby, PHP, Elixir | See `llms/examples/<language>.txt` |

### Create payload format

Flat map keyed by model name. Records link via `_alias` / `_ref`:

```json
{
  "action": "up",
  "testRunId": "run-abc123",
  "create": {
    "Organization": [{ "_alias": "org", "name": "Acme Corp" }],
    "User": [{ "_alias": "alice", "email": "alice@test.com", "organizationId": { "_ref": "org" } }]
  }
}
```

### Auth callback

Must return **real** working credentials:

- Web: `cookies` (session) or `headers` (Bearer JWT)
- Mobile (iOS/Android): `credentials` only (email/password) — cookies/headers not supported

### Security

- Production guard: 404 in production unless `allowProduction: true`
- HMAC-SHA256 on every request (`x-signature` header)
- Signed refsToken prevents unauthorized deletion
- `AUTONOMA_SHARED_SECRET` ≠ `AUTONOMA_SIGNING_SECRET`

## Scenario recipe schema (upload contract)

`autonoma/scenario-recipes.json` top-level shape:

```json
{
  "version": 1,
  "source": {
    "discoverPath": "autonoma/discover.json",
    "scenariosPath": "autonoma/scenarios.md"
  },
  "validationMode": "endpoint-lifecycle",
  "recipes": [{ "name": "...", "description": "...", "create": {}, "variables": {}, "validation": { "status": "validated", "method": "endpoint-up-down", "phase": "ok" } }]
}
```

Variable strategies: `literal`, `derived` (from `testRunId`), `faker`. Fetch `llms/reference/scenario-recipe-schema.txt` for full contract and rejection reasons.

## Previewkit

Vercel-style preview environments per PR. Configure stack in Autonoma dashboard (apps, services, hooks, env vars). GitHub App triggers build + deploy on PR open/sync, teardown on close.

Built-in env vars injected into previews: `AUTONOMA_PREVIEWKIT`, `AUTONOMA_PREVIEWKIT_PR`, `AUTONOMA_PREVIEWKIT_URL`. Secrets managed via REST API (owner-scoped or PR-scoped). Fetch `llms/previewkit.txt` and `llms/previewkit/secrets.txt`.

## Database safety (absolute)

When working with the Environment Factory or validation:

- **ALL writes** go through the SDK endpoint only
- **MAY** run read-only SELECT queries for verification
- **NEVER** INSERT/UPDATE/DELETE/DROP/TRUNCATE outside the SDK
- `down` only deletes what matching `up` created (verified by signed refsToken)

## Artifact checklist

Before starting a step, verify prerequisites exist:

| Artifact | Created by | Required for |
|----------|------------|--------------|
| `autonoma/AUTONOMA.md` | Step 1 | Steps 2–6 |
| `autonoma/features.json` | Step 1 | Validation hooks |
| `autonoma/entity-audit.md` | Step 2 | Steps 4–5 |
| `autonoma/scenarios.md` | Step 3 | Steps 4–6 |
| `autonoma/.endpoint-implemented` | Step 4 | Step 5 |
| `autonoma/scenario-recipes.json` | Step 5 | Dashboard + Step 6 |
| `autonoma/.endpoint-validated` | Step 5 | Step 6 |
| `autonoma/qa-tests/` | Step 6 | Upload to Autonoma |

## Execution discipline

1. Fetch the relevant doc page(s) for the current step
2. Check artifact prerequisites before proceeding
3. Present implementation plans for user approval before writing backend code (Step 4)
4. Pause at review checkpoints after Steps 1–5
5. Use subagents for parallel codebase exploration on large repos
6. Treat the codebase as source of truth — READMEs are hints only
7. Use the app's own UI vocabulary in tests and knowledge base
8. On validation failure: read the exact error, fix, retry — never skip gates
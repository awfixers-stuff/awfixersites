---
name: github-workflows
description: >
  GitHub Actions and workflows expert for authoring CI/CD from scratch — workflow
  YAML, triggers (push, pull_request, workflow_dispatch, repository_dispatch),
  jobs, steps, matrices, concurrency, caching, secrets, permissions, environments,
  reusable workflows, and composite/JavaScript/Docker actions. Use when creating
  `.github/workflows/*.yml`, scaffolding `.github/actions/`, or designing a new
  pipeline. Triggers on: "github workflow", "github action", "create workflow",
  "CI/CD pipeline", ".github/workflows", "composite action", "reusable workflow",
  "gha yaml". Use when the user runs /github-workflows.
---

# GitHub Workflows & Actions

Docs: https://docs.github.com/en/actions

Author workflows and actions from scratch. Read existing `.github/workflows/` and `.github/actions/` in the repo before adding or changing anything — match naming, triggers, and composite-action patterns already in use.

## Before writing

1. **Clarify intent** — CI check, deploy gate, release, scheduled job, external trigger (`repository_dispatch`), or manual (`workflow_dispatch`).
2. **Scan the repo** — package manager (`bun` here), monorepo layout (`apps/`, `packages/`), existing scripts in root `package.json`, and any composite actions under `.github/actions/`.
3. **Choose file name** — kebab-case under `.github/workflows/<purpose>.yml` (e.g. `lint.yml`, `release.yml`).
4. **Set permissions explicitly** — default `GITHUB_TOKEN` is read-only for `contents` since 2023; add only what the workflow needs.

## Workflow skeleton

Start every new workflow from this template and trim what you do not need:

```yaml
name: <Human-readable name>

on:
  push:
    branches: [master, main]
  pull_request:
  # workflow_dispatch:   # manual runs
  # schedule:            # cron: '0 6 * * 1'
  # repository_dispatch: # external webhooks (see vercel-deployment-checks.yml)

permissions:
  contents: read
  # statuses: write      # commit status API
  # id-token: write      # OIDC (AWS/GCP/Azure)

concurrency:
  group: <workflow>-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  <job-id>:
    name: <Job display name>
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4

      - name: <Step>
        run: echo "implement"
```

### Trigger cheat sheet

| Event | Use when |
|-------|----------|
| `push` / `pull_request` | Standard CI on branch activity |
| `workflow_dispatch` | Manual run from Actions tab; add `inputs` for parameters |
| `schedule` | Cron maintenance (dependabot-style, nightly checks) |
| `repository_dispatch` | External systems (Vercel, custom webhooks) post to GitHub |
| `workflow_call` | Reusable workflow invoked by other workflows |

Always pin third-party actions to a major version tag (`@v4`) or full SHA for supply-chain safety.

## awfixersites patterns

This monorepo uses **Bun**, workspace discovery, and **local composite actions**.

### Install composite action

Reuse `.github/actions/install` (wraps `setup-bun` + `bun install --frozen-lockfile`):

```yaml
- uses: ./.github/actions/install
```

Override Bun version via `with: bun-version: "1.3.14"` when needed.

### Bootstrap checkout (local actions before checkout action)

When a job must use `./.github/actions/*` and you cannot use `actions/checkout` first, bootstrap via git (pattern from `lint.yml`):

```yaml
- name: Bootstrap checkout
  env:
    GITHUB_TOKEN: ${{ github.token }}
  run: |
    set -euo pipefail
    git init .
    git remote add origin "https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
    git fetch --depth 1 origin "${GITHUB_SHA}"
    git checkout FETCH_HEAD
```

Otherwise prefer `actions/checkout@v4` (shallow: `fetch-depth: 1`).

### Matrix over workspaces

Discover `apps/` and `packages/` in a setup job, pass JSON to a matrix job:

```yaml
jobs:
  discover:
    runs-on: ubuntu-latest
    outputs:
      workspaces: ${{ steps.list.outputs.workspaces }}
    steps:
      - uses: actions/checkout@v4
      - id: list
        run: |
          workspaces=$(find apps packages -mindepth 1 -maxdepth 1 -type d | sort | jq -R -s -c 'split("\n") | map(select(length > 0))')
          echo "workspaces=$workspaces" >> "$GITHUB_OUTPUT"

  check:
    needs: discover
    strategy:
      fail-fast: false
      matrix:
        workspace: ${{ fromJson(needs.discover.outputs.workspaces) }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/install
      - run: bun run lint --filter "${{ matrix.workspace }}"
```

Use `fail-fast: false` on matrices so one workspace failure does not cancel the rest.

### Vercel deployment checks

`vercel-deployment-checks.yml` shows `repository_dispatch` + commit statuses via `vercel/repository-dispatch/actions/*`. Copy that pattern when wiring Vercel Deployment Checks — do not reinvent status reporting.

## Composite actions

Create under `.github/actions/<name>/action.yml` when the same steps repeat across jobs.

```yaml
name: <Action title>
description: <One line — shows in GitHub UI>

inputs:
  example:
    description: Input description
    required: false
    default: "value"

outputs:
  result:
    description: Output description
    value: ${{ steps.main.outputs.result }}

runs:
  using: composite
  steps:
    - id: main
      shell: bash
      run: |
        set -euo pipefail
        echo "result=ok" >> "$GITHUB_OUTPUT"
```

Rules for composite actions:

- Every `run` step needs `shell: bash` (or `pwsh` on Windows).
- Reference other local actions with `uses: ./.github/actions/<name>`.
- Pass inputs as `${{ inputs.example }}`.
- Expose outputs via `$GITHUB_OUTPUT`.

For logic that needs Node, prefer a **JavaScript action** (`action.yml` with `using: node20` + `dist/index.js`) or a repo script invoked from a composite step.

## Secrets, variables, and environments

| Mechanism | Scope | When |
|-----------|-------|------|
| `secrets.*` | Repo/org/env | Tokens, API keys — never log or echo |
| `vars.*` | Repo/org/env | Non-sensitive config |
| `github.token` | Per-run | Default `GITHUB_TOKEN`; set `permissions` to grant write |
| Environments | Per-env secrets + protection rules | Deploy approvals, prod-only secrets |

Reference: `${{ secrets.MY_TOKEN }}`. For OIDC to cloud providers, use `permissions: id-token: write` and provider-specific `aws-actions/configure-aws-credentials` (or equivalent).

## Caching

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.bun/install/cache
      node_modules
    key: bun-${{ runner.os }}-${{ hashFiles('bun.lock') }}
    restore-keys: bun-${{ runner.os }}-
```

Prefer cache keys tied to lockfiles. For Bun in this repo, caching install cache speeds up `bun install --frozen-lockfile`.

## Job orchestration

```yaml
jobs:
  build:
    outputs:
      version: ${{ steps.meta.outputs.version }}
    steps:
      - id: meta
        run: echo "version=1.0.0" >> "$GITHUB_OUTPUT"

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main' && success()
    runs-on: ubuntu-latest
    steps:
      - run: echo "${{ needs.build.outputs.version }}"
```

- `needs` — DAG between jobs.
- `if` — guard deploys (`github.ref`, `github.event_name`, `success()`, `failure()`).
- `outputs` — pass data across jobs (job-level `outputs` map step outputs).

## Reusable workflows

Caller (`.github/workflows/ci.yml`):

```yaml
jobs:
  lint:
    uses: ./.github/workflows/reusable-lint.yml
    secrets: inherit
```

Reusable (`.github/workflows/reusable-lint.yml`):

```yaml
on:
  workflow_call:
    inputs:
      node-version:
        required: false
        type: string
        default: "20"

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "${{ inputs.node-version }}"
```

Reusable workflows cannot define `runs-on` at the workflow root — only inside jobs.

## Implementation checklist

When building from scratch, verify:

- [ ] `name`, `on`, and at least one `job` with `runs-on` and `steps`
- [ ] `permissions` minimal and sufficient
- [ ] `concurrency` on PR/push workflows to avoid duplicate runs
- [ ] `timeout-minutes` on long or matrix jobs
- [ ] Secrets referenced but never printed; use `set -euo pipefail` in bash
- [ ] Local actions path is `./.github/actions/...` (leading `./` required)
- [ ] Matrix `fromJson` receives valid JSON array
- [ ] Workflow file is valid YAML (2-space indent, no tabs)

## Validate locally

```bash
# actionlint (install once)
brew install actionlint   # or: curl ... | bash

actionlint .github/workflows/*.yml
```

If `actionlint` is unavailable, at least run `yamllint` or parse with Python:

```bash
python3 -c "import yaml,sys; yaml.safe_load(open(sys.argv[1]))" .github/workflows/lint.yml
```

## Agent workflow

1. Read user goal and existing `.github/workflows/` + `.github/actions/`.
2. Propose trigger, jobs, and whether to reuse composite actions.
3. Write the YAML file(s); prefer extending existing patterns over new abstractions.
4. Run `actionlint` or YAML validation when possible.
5. Summarize: what triggers the workflow, required secrets/vars, and how to test (push branch, `workflow_dispatch`, or `gh workflow run`).

```bash
gh workflow list
gh workflow run <workflow-file.yml> --ref <branch>
gh run watch
```
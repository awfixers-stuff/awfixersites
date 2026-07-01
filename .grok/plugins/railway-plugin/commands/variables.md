---
name: variables
description: List, pull, or set Railway environment variables. Pass "pull" to save locally, or KEY=value to set.
---

# Railway Variables

Manage Railway environment variables for the linked service.

## Steps

1. Load `railway-variables` skill.
2. Check link: `railway status`

### List (default)

```bash
railway variables
```

Present as table: name, value (mask secrets — show first 4 chars + `***` for URLs/tokens).

### Pull to local

If "$ARGUMENTS" is "pull":

```bash
railway variables --json
```

Write non-secret vars to `.env.local` (append, don't overwrite existing). Warn that `.env.local` is gitignored. Never commit pulled secrets.

### Set

If "$ARGUMENTS" matches `KEY=value`:

```bash
railway variables set $ARGUMENTS
```

**Warning:** If Terraform manages this variable, setting via CLI causes drift. Check `infra/backend/main.tf` first.

### Production safety

Rotating `DATABASE_URL` on auth services requires migration plan. Ask for confirmation.
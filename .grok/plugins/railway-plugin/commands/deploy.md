---
name: deploy
description: Deploy the linked Railway service. Pass service name as argument if needed.
---

# Railway Deploy

Deploy a Railway service. **awfixersites Next.js apps deploy to Vercel, not Railway.**

## Preflight

1. Load `railway-deployments` and `railway-cli` skills.
2. Confirm target is a Railway service (Postgres, worker, webhook) — not a Next.js app.
3. Check link context:
   ```bash
   railway status
   ```
4. If not linked, run `/railway:link` first.

## Plan

If "$ARGUMENTS" specifies a service name, note it. Otherwise deploy the linked service.

> **Production warning:** If the linked environment is production, ask for explicit confirmation before deploying.

## Deploy

```bash
railway up
```

Capture deployment output. Extract deployment ID or URL if shown.

## Verify

```bash
railway logs
railway status
```

## Summary

```
## Deploy Result
- Service: <name>
- Environment: <env>
- Status: success / failed
- Logs: <first error if failed>
```

On failure, load `deployment-debugger` agent for systematic diagnosis.

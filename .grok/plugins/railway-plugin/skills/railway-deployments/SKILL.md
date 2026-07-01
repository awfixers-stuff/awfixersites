---
name: railway-deployments
description: >
  Railway deployment expert for awfixersites. Use when deploying, redeploying,
  or debugging Railway service deployments. Triggers on: "railway deploy",
  "redeploy railway", "railway deployment failed", "railway up". Use when
  the user runs /railway:deploy.
---

# Railway Deployments (awfixersites)

## Deploy methods

| Method | When |
|--------|------|
| Terraform | Durable service config (Postgres, workers) |
| CLI `railway up` | Ad-hoc deploy from linked directory |
| MCP `deploy` | Agent-driven deploy from natural language |
| MCP `redeploy` (remote) | Restart without code change |
| Git push | If service has Railway GitHub integration |

## CLI deploy

```bash
railway link          # ensure correct project/service
railway up            # deploy current directory
railway up --detach   # don't stream logs
```

## Verify deployment

```bash
railway status
railway logs
railway logs --follow
railway open          # dashboard
```

## Failure diagnostic tree

```
Deploy failed?
├─ Build error
│  ├─ Check Dockerfile / nixpacks config
│  ├─ Missing env var? → railway variables
│  └─ Wrong root directory? → check railway.toml
├─ Runtime crash
│  ├─ railway logs --follow
│  ├─ DATABASE_URL missing? → check Postgres service + variables
│  └─ Port binding? → Railway expects $PORT env var
├─ Health check failure
│  ├─ Service not listening on $PORT
│  └─ Startup too slow → increase health check timeout
└─ Volume / data issue
   ├─ Postgres not ready → wait for template init
   └─ Connection refused → check internal networking
```

For complex failures, use remote MCP `railway-agent` tool.

## awfixersites context

- Next.js apps deploy to **Vercel**, not Railway
- Railway deploys: Postgres, future workers, webhook receivers
- Never deploy a Next.js app to Railway without explicit user request
- Production deploys require user confirmation

## Redeploy (no code change)

```bash
# Via remote MCP
redeploy <service> in production

# Via dashboard
Project → Service → Deployments → Redeploy
```
---
name: logs
description: View Railway service logs. Pass --follow to stream, or a service name.
---

# Railway Logs

Fetch or stream logs for the linked Railway service.

## Steps

1. Load `railway-cli` skill.
2. Check link context: `railway status`
3. If "$ARGUMENTS" contains "follow":
   ```bash
   railway logs --follow
   ```
   Otherwise:
   ```bash
   railway logs
   ```
4. If MCP available, use `get-logs` tool as alternative.
5. Present last 50 lines. Highlight lines containing `error`, `Error`, `FATAL`, `panic`, `ECONNREFUSED`.
6. If logs show DB connection errors, check `railway-postgres` and `railway-vercel-wiring` skills for `DATABASE_URL` wiring.

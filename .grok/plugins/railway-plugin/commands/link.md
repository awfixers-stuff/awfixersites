---
name: link
description: Link the current directory to a Railway project and service
---

# Railway Link

Link the working directory to a Railway project and service.

## Steps

1. Load `railway-cli` skill.
2. Verify auth:
   ```bash
   railway whoami
   ```
   If not logged in: `railway login`
3. List available projects:
   ```bash
   railway list
   ```
4. Run interactive link:
   ```bash
   railway link
   ```
5. Verify:
   ```bash
   railway status
   ```
6. Report linked project, service, and environment.

If "$ARGUMENTS" specifies a project name, guide user to select it during interactive link.

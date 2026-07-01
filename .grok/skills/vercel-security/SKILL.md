---
name: vercel-security
description: >
  Vercel security expert from vercel.com/docs — Vercel Firewall (DDoS, WAF, custom
  rules, rate limiting, bot management, Attack Mode), Deployment Protection (Vercel
  Auth, password, trusted IPs, bypass tokens), BotID, compliance, and firewall CLI.
  Use when hardening preview/production access, writing WAF rules, or debugging
  blocked requests. Triggers on: "vercel firewall", "WAF", "deployment protection",
  "bot management", "rate limit", "attack mode", "DDoS". Use when the user runs
  /vercel-security. Complements /vercel-iac (infra/firewall Terraform).
---

# Vercel Security

Docs: https://vercel.com/docs/security

Security has two pillars: **governance/compliance** (policies, SOC2, encryption) and **multi-layered protection** (firewall, deployment protection, bots).

awfixersites has per-app firewall stubs in `infra/firewall/<app>/main.tf` — coordinate with `/vercel-iac`.

## Request protection layers

```
Internet → Platform Firewall (DDoS) → WAF (custom rules) → Deployment Protection → App
```

Firewall evaluates **first** in routing order (before redirects, cache, functions). See `/vercel-routing`.

## Vercel Firewall

### Platform-wide (free, automatic)

- DDoS mitigation
- Low-quality traffic filtering
- No configuration required

### Web Application Firewall (WAF)

Project-level customizable rules:

| Feature | Description |
|---------|-------------|
| **Custom rules** | Block/challenge by IP, path, header, geo, user-agent |
| **Managed rulesets** | OWASP, bot detection presets |
| **Rate limiting** | Per-IP or per-path request limits |
| **IP blocking** | Block/allow specific IPs or CIDR ranges |
| **Attack Mode** | Elevated protection during active attack |
| **System bypass** | Allow trusted IPs through all rules |
| **Observability** | Firewall logs and traffic analytics |

### CLI

```bash
bunx vercel firewall overview
bunx vercel firewall publish              # publish staged rule changes
bunx vercel firewall rules list
bunx vercel firewall ip-blocks block 1.2.3.4
bunx vercel firewall ip-blocks unblock 1.2.3.4
bunx vercel firewall attack-mode enable
bunx vercel firewall attack-mode disable
```

### Terraform (awfixersites)

Per-app stubs: `infra/firewall/<app>/main.tf`. Consolidate with `for_each` over app keys. Match live dashboard rules before import.

## Deployment Protection

Controls who accesses preview and production URLs. **Requires auth for all requests including middleware.**

Settings: Project → Settings → Deployment Protection.

### Protection methods

| Method | Plans | Description |
|--------|-------|-------------|
| **Vercel Authentication** | All | Only Vercel team members with access |
| **Password Protection** | Enterprise / Pro add-on | Shared password |
| **Trusted IPs** | Enterprise | IP allowlist (can protect production only) |
| **Passport** | Enterprise (beta) | Identity provider SSO |

### Protection scope

| Scope | Plans | What's protected |
|-------|-------|-----------------|
| **Standard Protection** | All | All except production custom domains |
| **All Deployments** | Pro add-on / Enterprise | Everything including production domains |
| **Trusted IPs (prod only)** | Enterprise | Production only; previews stay public |

Hobby: Vercel Auth + Standard Protection only. Production custom domains stay public.

### Bypass methods

For CI, webhooks, and shareable links:

- **Protection Bypass for Automation** — secret token in header/query
- **Deployment Protection Exceptions** — specific paths bypass protection
- **Shareable links** — per-URL bypass for stakeholders

```bash
bunx vercel curl /api/health    # auto bypasses protection for linked project
bunx vercel httpstat /api/slow  # same bypass behavior
```

### Code impact (auth satellites)

When Standard Protection enabled, `VERCEL_URL` is no longer publicly accessible on protected deployments:

```typescript
// ❌ Breaks on protected previews
fetch(`${process.env.VERCEL_URL}/api/data`);

// ✅ Client-side
fetch("/api/data");

// ✅ Server-side — forward cookies
fetch(`${request.nextUrl.origin}/api/data`, {
  headers: { cookie: request.headers.get("cookie") ?? "" },
});
```

awfixersites auth uses `VERCEL_URL` in `packages/auth/src/config.ts` for OAuth — verify preview redirect URIs still work with protection enabled.

### Protected Source Maps

Gates `.map` files behind Vercel Authentication — ship source maps to production without exposing source.

## Bot Management

Detect and manage automated traffic:

- Challenge suspicious bots
- Allow verified crawlers (Google, etc.)
- Integrates with WAF rules

awfixersites uses **BotID** (`botid` package) — Vercel-specific, no Terraform equivalent.

## BotID vs Firewall

| | BotID | Firewall/WAF |
|---|-------|-------------|
| Scope | Application-level bot detection | Edge/network-level rules |
| Config | npm package in app code | Dashboard/CLI/Terraform |
| Use | Form submissions, sensitive actions | DDoS, geo-blocking, rate limits |

## Compliance & encryption

- HTTPS on all deployments (automatic SSL)
- SOC2 Type 2
- Data encryption at rest and in transit
- Shared responsibility model — you secure app code, secrets, access

## Security settings (project)

Dashboard → Settings → Security:

- Attack Mode toggle
- Logs protection (hide sensitive deployment logs)
- Fork protection (prevent secret leakage on forked PRs)
- OIDC for secure CI/CD token exchange
- Deployment retention policies

Configurable via `vercel.json` security settings section.

## Rate limiting patterns

```bash
# WAF custom rule example (dashboard):
# IF path matches /api/auth/* AND rate > 100/min THEN challenge
```

Protect auth endpoints (`apps/auth`) especially — IdP downtime breaks all satellites.

## awfixersites safety rules

1. **Never** expose `AUTH_SECRET`, `PRISMA_DATABASE_URL`, or OAuth client secrets in logs
2. Auth IdP (`awfixersites-auth-app`) — highest protection priority
3. Preview env vars must stay intact for OAuth satellite testing
4. Firewall changes: `terraform plan` before apply in `infra/firewall/`
5. Test deployment protection impact on auth flows before enabling All Deployments scope

## Incident response

```bash
# Active attack
bunx vercel firewall attack-mode enable
bunx vercel firewall ip-blocks block <attacker-ip>

# Investigate
bunx vercel firewall overview
# Dashboard → Firewall → Logs

# After incident
bunx vercel firewall attack-mode disable
bunx vercel firewall publish
```

## Related

- `/vercel-iac` — `infra/firewall/` Terraform stubs
- `/vercel-routing` — firewall is routing layer 1
- `/vercel-deployments` — protection applies per deployment/environment
- `/vercel-domains` — HTTPS/SSL automatic

Deep references:
- [references/deployment-protection.md](references/deployment-protection.md)
- [references/firewall-rules.md](references/firewall-rules.md)
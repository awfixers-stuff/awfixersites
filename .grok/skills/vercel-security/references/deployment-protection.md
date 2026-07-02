# Deployment Protection Reference

Source: https://vercel.com/docs/deployment-protection

## Plan matrix

| Feature                        | Hobby | Pro              | Enterprise |
| ------------------------------ | ----- | ---------------- | ---------- |
| Vercel Authentication          | ✓     | ✓                | ✓          |
| Standard Protection            | ✓     | ✓                | ✓          |
| All Deployments (private prod) | ✗     | Add-on ($150/mo) | ✓          |
| Password Protection            | ✗     | Add-on           | ✓          |
| Trusted IPs                    | ✗     | ✗                | ✓          |
| Passport (IdP SSO)             | ✗     | ✗                | ✓ (beta)   |

## Advanced Deployment Protection add-on (Pro)

$150/month unlocks all advanced features:

- Password Protection
- Private Production Deployments (All Deployments scope)
- Deployment Protection Exceptions

Minimum 30-day commitment before cancellation.

## Bypass for automation

Header: `x-vercel-protection-bypass: <secret>`

Set in Project → Settings → Deployment Protection → Protection Bypass for Automation.

Use in CI/CD for E2E tests against protected previews. Do not commit bypass secrets.

## Team defaults

Team Settings → Deployment Protection → set default for new projects. Individual projects can override.

## Legacy modes (migrate away)

- **(Legacy) Standard Protection** — protects previews + deployment URLs, not up-to-date production
- **(Legacy) Pre-Production Deployments** — preview URLs only

Migrate to current Standard Protection for recommended behavior.

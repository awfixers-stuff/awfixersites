# Firewall Rules Reference

Source: https://vercel.com/docs/security/vercel-waf, https://vercel.com/docs/vercel-firewall

## Rule actions

| Action | Effect |
|--------|--------|
| **deny** | Block request (403) |
| **challenge** | CAPTCHA/bot challenge |
| **log** | Allow but log (monitoring mode) |
| **bypass** | Skip remaining rules (system bypass) |

## Common rule conditions

- Source IP / CIDR
- Request path (glob)
- HTTP method
- Header values (User-Agent, Referer, etc.)
- Geo (country)
- Request rate (rate limiting)

## Attack Mode

Elevates platform-wide protection temporarily. Enable during active DDoS or abuse. Disable after incident resolved.

## Firewall observability

Dashboard → Project → Firewall → Overview / Logs

Metrics: blocked requests, challenged requests, top blocked IPs, rule hit counts.

## IaC coordination (awfixersites)

`infra/firewall/<app>/main.tf` should mirror dashboard rules. Workflow:

1. Prototype rule in dashboard
2. Export/document rule
3. Add to Terraform module
4. `terraform import` if rule exists
5. `terraform plan` until empty diff
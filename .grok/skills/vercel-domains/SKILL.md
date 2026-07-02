---
name: vercel-domains
description: >
  Vercel domains expert from vercel.com/docs — custom domains, DNS records (A, CNAME,
  MX, TXT), nameservers, SSL/TLS certificates, apex vs subdomain setup, domain
  troubleshooting, and CLI domain management. Use when adding domains, fixing DNS/SSL
  issues, or configuring awfixer.* properties. Triggers on: "vercel domain", "custom
  domain", "DNS", "SSL certificate", "nameserver", "CNAME", "apex domain". Use when
  the user runs /vercel-domains. Complements /vercel-iac for Terraform domain resources.
---

# Vercel Domains

Docs: https://vercel.com/docs/domains

awfixersites uses custom domains per satellite (`awfixer.church`, `donate.awfixer.church`, etc.). Terraform manages `vercel_project_domain` resources (`/vercel-iac`); this skill covers DNS/SSL mechanics.

## DNS fundamentals

Browser → recursive resolver → root → TLD → authoritative nameserver → IP address.

Vercel-hosted sites resolve to Vercel's anycast CDN (historically `76.76.21.21` for A records; prefer CNAME to `cname.vercel-dns.com`).

## Adding a domain

### Dashboard

1. Project → Settings → Domains → Add
2. Enter domain (apex or subdomain)
3. Follow DNS configuration instructions
4. Vercel auto-provisions SSL once DNS propagates

### CLI

```bash
bunx vercel domains ls
bunx vercel domains add awfixer.church awfixersites-church
bunx vercel domains rm awfixer.church
bunx vercel dns ls awfixer.church
bunx vercel dns add awfixer.church www CNAME cname.vercel-dns.com
bunx vercel certs ls
```

### Terraform (awfixersites canonical)

```hcl
resource "vercel_project_domain" "church" {
  project_id = vercel_project.church.id
  domain     = "awfixer.church"
}
```

Import existing: `terraform import vercel_project_domain.church <project_id>/<domain>`

## DNS record types

| Type      | Use                                |
| --------- | ---------------------------------- |
| **A**     | Apex domain → IP (`76.76.21.21`)   |
| **CNAME** | Subdomain → `cname.vercel-dns.com` |
| **TXT**   | Domain verification, SPF, DKIM     |
| **MX**    | Mail routing (Mailgun, etc.)       |
| **NS**    | Delegate to nameserver             |

### Apex domain options

1. **A record** → `76.76.21.21` (at DNS provider)
2. **Vercel nameservers** — transfer DNS to Vercel (simplest for full Vercel DNS management)
3. **ALIAS/ANAME** — some providers support CNAME-like at apex

### Subdomain

```
www.awfixer.church  CNAME  cname.vercel-dns.com
donate.awfixer.church  CNAME  cname.vercel-dns.com
```

awfixersites pattern: apex per property + `donate.<apex>` subdomain on `awfixersites-donate`.

## SSL/TLS

- Every Vercel deployment gets HTTPS automatically
- Custom domains: Vercel issues free SSL via Let's Encrypt
- Certificates auto-renew
- No manual cert management unless bringing your own (Enterprise)

```bash
bunx vercel certs ls
bunx vercel certs issue example.com
```

### SSL troubleshooting

| Symptom               | Fix                                                       |
| --------------------- | --------------------------------------------------------- |
| Certificate pending   | DNS not propagated; wait or verify records                |
| Certificate error     | CNAME pointing wrong target; check dashboard instructions |
| Mixed content         | Ensure all assets use HTTPS                               |
| Cert on wrong project | Domain may be assigned to different Vercel project        |

## Domain → deployment assignment

Domains point to **production** deployment by default. Can assign any deployment:

- Dashboard: Deployment → ... → Assign Domain
- CLI: `vercel alias set <deployment-url> <domain>`

Preview deployments get auto-generated `*.vercel.app` URLs — custom domains are production unless explicitly assigned.

## awfixersites domain map

| Domain                  | Project                | Notes              |
| ----------------------- | ---------------------- | ------------------ |
| `awfixer.church`        | `awfixersites-church`  | apex               |
| `donate.awfixer.church` | `awfixersites-donate`  | separate project   |
| `careers.awfixer.llc`   | `awfixersites-careers` | redirect target    |
| `legal.awfixer.llc`     | `awfixersites-legal`   | redirect target    |
| Per-app apex            | `awfixersites-<app>`   | see fleet registry |

Satellite apps redirect `/donate` → `donate.<apex>` via `vercel.ts` (not DNS).

## Nameservers

Two approaches:

1. **External DNS** (Cloudflare, etc.) — add A/CNAME records at provider; keep existing nameservers
2. **Vercel DNS** — point NS records to Vercel; manage all records in Vercel dashboard

For Mailgun email on same domain: MX/TXT records at DNS provider alongside Vercel web records.

## Preview deployment suffix

Teams can configure custom preview suffix (e.g. `preview.awfixer.church`) instead of `*.vercel.app`. Pro/Enterprise feature.

## Troubleshooting checklist

1. `dig awfixer.church` / `dig CNAME www.awfixer.church` — verify records
2. Dashboard → Domains → check status (Valid / Invalid Configuration)
3. Confirm domain assigned to correct project (not duplicate across projects)
4. DNS propagation: up to 48h (usually minutes)
5. Check for conflicting records (old A record + new CNAME)
6. OAuth redirect URIs must match exact domain (auth deployment)

```bash
dig +short awfixer.church
dig +short CNAME donate.awfixer.church
curl -I https://awfixer.church  # check SSL + redirects
```

## Domain purchase/transfer

```bash
bunx vercel domains check example.com
bunx vercel domains price example.com
bunx vercel domains buy example.com
```

Transfer out: get auth code via API/dashboard.

## Related

- `/vercel-iac` — `vercel_project_domain` Terraform resources
- `/vercel-routing` — redirects between domains (legal, careers, donate)
- `/vercel-deployments` — assign domain to specific deployment
- `/vercel-security` — HTTPS, deployment protection on domains

Deep reference: [references/dns-records.md](references/dns-records.md)

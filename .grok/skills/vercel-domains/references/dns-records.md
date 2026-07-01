# DNS Records Reference

Source: https://vercel.com/docs/domains/working-with-dns

## Common awfixersites setups

### Web only (external DNS provider)

```
# Apex
awfixer.church.     A      76.76.21.21

# Subdomain
donate.awfixer.church.  CNAME  cname.vercel-dns.com.
www.awfixer.church.     CNAME  cname.vercel-dns.com.
```

### With email (Mailgun)

```
# Web (Vercel)
awfixer.church.     A      76.76.21.21

# Email (Mailgun) — do not conflict with web records
awfixer.church.     MX     10 mxa.mailgun.org.
awfixer.church.     MX     10 mxb.mailgun.org.
awfixer.church.     TXT    "v=spf1 include:mailgun.org ~all"
k1._domainkey.awfixer.church.  CNAME  k1.domainkey.mailgun.org.
```

### Domain verification TXT

Vercel may require TXT record for ownership verification before SSL issuance.

## Wildcard domains

`*.awfixer.church` CNAME → `cname.vercel-dns.com` — covers all subdomains. Individual records override wildcard.

## IPv6

Vercel primarily uses IPv4 for custom domains. AAAA records not typically required.

## DNS propagation tools

- `dig`, `nslookup`, `host`
- https://dnschecker.org for global propagation view
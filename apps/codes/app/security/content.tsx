"use client";

import React from "react";
import {
  PageHeader,
  Section,
  StatCard,
  ComplianceBadge,
  SecurityFeature,
  ThreatModel,
  ArchitectureLayer,
} from "@/app/shared/mdx-components";
import { MdxComponents } from "@/components/mdx-components";

export default function SecurityContent() {
  return (
    <div>
      <PageHeader
        title="Security & Stability Model"
        description="At AWFixer Codes, we believe that trust is built through transparency, rigor, and unwavering commitment to protecting what matters most. Our security and stability model encompasses everything from infrastructure hardening to cryptographic guarantees."
      />

      <Section title="Security Posture">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Uptime SLA" value="99.99%" trend="up" />
          <StatCard label="Mean Time to Detect" value="< 5 min" trend="up" />
          <StatCard label="Mean Time to Respond" value="< 15 min" trend="up" />
          <StatCard label="Encryption Coverage" value="100%" trend="up" />
        </div>
      </Section>

      <Section title="Compliance & Certifications">
        <div className="space-y-3">
          <ComplianceBadge
            standard="SOC 2 Type II"
            description="Annual independent audit of security controls"
            certified={true}
          />
          <ComplianceBadge
            standard="ISO 27001"
            description="Information security management certified"
            certified={true}
          />
          <ComplianceBadge
            standard="GDPR"
            description="Full EU data protection compliance"
            certified={true}
          />
          <ComplianceBadge
            standard="HIPAA"
            description="Healthcare data protection ready"
            certified={false}
          />
        </div>
      </Section>

      <Section title="Cryptographic Architecture">
        <div className="space-y-4">
          <SecurityFeature
            title="End-to-End Encryption"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
            status="implemented"
          >
            All data encrypted using AES-256-GCM in transit and at rest. Client-side encryption keys
            never leave user devices. Perfect forward secrecy implemented for all communication
            channels.
          </SecurityFeature>

          <SecurityFeature
            title="Zero-Knowledge Architecture"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            }
            status="implemented"
          >
            Our zero-knowledge protocol ensures that AWFixer Codes cannot access user data even if
            compelled. Encryption keys are derived from user credentials using Argon2id with 128MB
            memory cost.
          </SecurityFeature>

          <SecurityFeature
            title="Hardware Security Modules"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2H3v-2a8 8 0 018-8H3z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16h.01" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16h.01" />
              </svg>
            }
            status="implemented"
          >
            Root encryption keys stored in AWS CloudHSM and Azure Key Vault with FIPS 140-2 Level 3
            certification. All cryptographic operations performed within secure enclaves.
          </SecurityFeature>

          <SecurityFeature
            title="Multi-Factor Authentication"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
            status="implemented"
          >
            FIDO2/WebAuthn support, TOTP, and biometric authentication. MFA enforcement policies
            configurable at organization, team, and repository levels.
          </SecurityFeature>
        </div>
      </Section>

      <Section title="Threat Model">
        <div className="space-y-4">
          <ThreatModel
            threat="Data Breach via Compromised Credentials"
            likelihood="medium"
            impact="high"
            mitigation="MFA enforcement, session timeouts, anomaly detection, and automated credential rotation. All passwords hashed with Argon2id (t=3, m=128MB, p=4)."
          />
          <ThreatModel
            threat="Supply Chain Attack"
            likelihood="medium"
            impact="high"
            mitigation="Dependency scanning (SAST/DAST), SBOM generation, signed commits verification, and reproducible builds. All dependencies pinned with cryptographic hashes."
          />
          <ThreatModel
            threat="Insider Threat"
            likelihood="low"
            impact="medium"
            mitigation="Principle of least privilege, separation of duties, comprehensive audit logging, and behavior analytics. No single person has production database access."
          />
          <ThreatModel
            threat="DDoS Attack"
            likelihood="high"
            impact="medium"
            mitigation="Cloudflare DDoS protection, rate limiting, circuit breakers, and auto-scaling infrastructure. Request throttling at edge locations."
          />
        </div>
      </Section>

      <Section title="Architecture Layers">
        <ArchitectureLayer
          name="Edge Layer"
          description="Global CDN and DDoS protection layer"
          technologies={["Cloudflare", "AWS CloudFront", "WAF"]}
          securityControls={[
            "TLS 1.3 termination",
            "Rate limiting (100 req/min per IP)",
            "Bot detection and mitigation",
            "Geo-blocking capabilities",
          ]}
        />
        <ArchitectureLayer
          name="API Gateway"
          description="Authentication and request routing layer"
          technologies={["Envoy", "OAuth 2.0", "JWT"]}
          securityControls={[
            "mTLS between services",
            "Request validation and sanitization",
            "CORS policy enforcement",
            "API key rotation (30-day cycle)",
          ]}
        />
        <ArchitectureLayer
          name="Application Layer"
          description="Business logic and processing"
          technologies={["Next.js", "Node.js", "TypeScript"]}
          securityControls={[
            "Input validation with Zod",
            "SQL injection prevention (Prisma)",
            "XSS protection headers",
            "CSRF tokens on all state-changing operations",
          ]}
        />
        <ArchitectureLayer
          name="Data Layer"
          description="Encrypted storage and replication"
          technologies={["PostgreSQL", "S3", "Redis"]}
          securityControls={[
            "AES-256 encryption at rest",
            "Row-level security policies",
            "Automated backups (encrypted)",
            "Point-in-time recovery (7-day window)",
          ]}
        />
      </Section>

      <Section title="Incident Response">
        <div className="space-y-4">
          <SecurityFeature
            title="24/7 Security Monitoring"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
            status="implemented"
          >
            Continuous monitoring via Prometheus, Grafana, and PagerDuty. Security events trigger
            automated response playbooks and immediate team notification. Post-incident reviews
            conducted within 48 hours.
          </SecurityFeature>

          <SecurityFeature
            title="Bug Bounty Program"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            status="in-progress"
          >
            Public bug bounty program launching Q3 2025 via HackerOne. Rewards up to $50,000 for
            critical vulnerabilities. All reports triaged within 4 hours.
          </SecurityFeature>
        </div>
      </Section>

      <Section title="Audit Trail">
        <SecurityFeature
          title="Immutable Audit Logging"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          status="implemented"
        >
          All administrative actions, data access, and configuration changes logged to immutable
          storage. Logs signed with HMAC-SHA256 and retained for 7 years. Real-time log aggregation
          in Grafana Loki.
        </SecurityFeature>
      </Section>

      <Section title="Data Residency & Sovereignty">
        <SecurityFeature
          title="Regional Data Isolation"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          status="implemented"
        >
          Customer data stored in region-specific data centers (US-East, EU-West, APAC). Data never
          transferred across regions without explicit consent. Regional failover within same
          jurisdiction only.
        </SecurityFeature>
      </Section>

      <Section title="Stability Guarantees">
        <div className="space-y-4">
          <SecurityFeature
            title="Chaos Engineering"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            }
            status="in-progress"
          >
            Automated chaos experiments run weekly using Gremlin. Testing node failures, network
            partitions, and dependency outages. Current uptime: 99.97% over 12 months.
          </SecurityFeature>

          <SecurityFeature
            title="Disaster Recovery"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
            status="implemented"
          >
            Cross-region replication with RPO &lt; 5 minutes, RTO &lt; 30 minutes. Tested quarterly
            with full environment failover drills. Encrypted snapshots retained for 30 days.
          </SecurityFeature>
        </div>
      </Section>

      <Section title="Security by Design">
        <MdxComponents>
          <ul>
            <li>
              <strong>Privacy by Default:</strong> No telemetry, no tracking, no data mining
            </li>
            <li>
              <strong>Open Source Core:</strong> Critical security components open for public review
            </li>
            <li>
              <strong>Transparency Reports:</strong> Quarterly security and privacy transparency
              reports
            </li>
            <li>
              <strong>Responsible Disclosure:</strong> 90-day disclosure policy with coordinated
              vulnerability disclosure
            </li>
            <li>
              <strong>Secure Development:</strong> Security training mandatory for all engineers,
              code review with security focus
            </li>
          </ul>
        </MdxComponents>
      </Section>

      <Section title="Our Commitment">
        <MdxComponents>
          <p>
            We maintain a <strong className="text-foreground">Security First</strong> posture across
            AWFixer Codes and Grip. Security isn&apos;t a feature—it&apos;s the foundation upon
            which everything else is built. We invest 20% of engineering capacity in security
            improvements, debt reduction, and resilience engineering.
          </p>
          <blockquote>
            &ldquo;Security is not a product, but a process.&rdquo; &mdash; Bruce Schneier
          </blockquote>
        </MdxComponents>
      </Section>

      <div className="text-sm text-muted-foreground pt-6 border-t border-border">
        <p>
          <strong>Last Updated:</strong> May 2025
        </p>
        <p>
          <strong>Next Review:</strong> August 2025
        </p>
        <p>
          <strong>Questions?:</strong> security@awfixer.me
        </p>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { PageHeader, Section } from "@/app/shared/mdx-components";
import { MdxComponents } from "@/components/mdx-components";

export default function PrivacyContent() {
  return (
    <div>
      <PageHeader
        title="Privacy Policy"
        description='At AWFixer Enterprising Inc, OSS Division ("AWFixer Codes", "we", "us", "our"), we take your privacy seriously. This policy explains what data we collect, how we use it, and the choices you have.'
      />

      <Section title="1. Information We Collect">
        <MdxComponents>
          <h3>Information You Provide</h3>
          <ul>
            <li>
              <strong>Account information:</strong> name, email address, and password when you
              create an account.
            </li>
            <li>
              <strong>Profile information:</strong> display name, avatar, and organization details
              you choose to provide.
            </li>
            <li>
              <strong>Communication data:</strong> content of support requests, feedback, and
              correspondence with us.
            </li>
            <li>
              <strong>Payment information:</strong> billing details processed through our secure
              payment provider; we never store full credit card numbers on our servers.
            </li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <ul>
            <li>
              <strong>Usage data:</strong> pages visited, features used, and interaction patterns
              within our platform.
            </li>
            <li>
              <strong>Device data:</strong> browser type, operating system, IP address, and general
              geographic region (country-level only).
            </li>
            <li>
              <strong>Performance data:</strong> error reports and performance metrics that help us
              improve reliability.
            </li>
          </ul>
        </MdxComponents>
      </Section>

      <Section title="2. How We Use Your Information">
        <MdxComponents>
          <ul>
            <li>Providing, maintaining, and improving our services</li>
            <li>Sending important service notifications (security alerts, billing updates)</li>
            <li>Understanding usage patterns to improve user experience</li>
            <li>Ensuring platform security, preventing fraud, and enforcing our terms</li>
            <li>Complying with legal obligations</li>
          </ul>
        </MdxComponents>
      </Section>

      <Section title="3. Data Retention & Deletion">
        <MdxComponents>
          <p>
            We retain your personal data only as long as necessary for the purposes outlined in this
            policy. Upon account deletion:
          </p>
          <ul>
            <li>Personal account data is permanently deleted within 30 days</li>
            <li>Repository data is deleted immediately upon confirmation</li>
            <li>Anonymized usage statistics may be retained for analytics</li>
            <li>Backup copies are purged within 90 days</li>
          </ul>
          <p>
            You may request full data export or deletion at any time by contacting
            privacy@awfixer.me.
          </p>
        </MdxComponents>
      </Section>

      <Section title="4. Data Sharing">
        <MdxComponents>
          <p>We do not sell your personal data. We share data only with:</p>
          <ul>
            <li>
              <strong>Service providers:</strong> infrastructure hosting, payment processing, and
              email delivery — each contractually obligated to protect your data
            </li>
            <li>
              <strong>Legal requirements:</strong> when required by law, court order, or
              governmental authority
            </li>
            <li>
              <strong>Business transfers:</strong> in connection with a merger, acquisition, or
              asset sale, with notice to affected users
            </li>
          </ul>
        </MdxComponents>
      </Section>

      <Section title="5. Security">
        <MdxComponents>
          <p>We implement industry-standard security measures including:</p>
          <ul>
            <li>AES-256 encryption for data at rest</li>
            <li>TLS 1.3 encryption for data in transit</li>
            <li>Zero-knowledge architecture for sensitive credentials</li>
            <li>Regular third-party security audits (SOC 2 Type II, ISO 27001)</li>
            <li>Bug bounty program for responsible vulnerability disclosure</li>
          </ul>
          <p>
            For our complete security posture, see our <a href="/security">Security page</a>.
          </p>
        </MdxComponents>
      </Section>

      <Section title="6. Your Rights">
        <MdxComponents>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict processing</li>
            <li>Data portability (receive your data in a machine-readable format)</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          <p>
            Exercise any of these rights by contacting privacy@awfixer.me. We respond to all
            requests within 30 days.
          </p>
        </MdxComponents>
      </Section>

      <Section title="7. Cookies & Tracking">
        <MdxComponents>
          <p>
            We use minimal, essential cookies for authentication and security (CSRF protection,
            session management). We do not use advertising trackers or sell browsing data. Analytics
            are collected in aggregated, anonymized form only.
          </p>
        </MdxComponents>
      </Section>

      <Section title="8. International Data Transfers">
        <MdxComponents>
          <p>
            Customer data is stored in region-specific data centers (US-East, EU-West, APAC). Data
            is never transferred across regions without explicit consent. We maintain Standard
            Contractual Clauses (SCCs) for any necessary cross-border transfers and comply with
            GDPR, CCPA, and other applicable data protection frameworks.
          </p>
        </MdxComponents>
      </Section>

      <Section title="9. Children's Privacy">
        <MdxComponents>
          <p>
            AWFixer Codes is not directed to children under 16. We do not knowingly collect personal
            data from children. If we discover we have collected data from a child under 16, we will
            delete it promptly.
          </p>
        </MdxComponents>
      </Section>

      <Section title="10. Changes to This Policy">
        <MdxComponents>
          <p>
            We may update this Privacy Policy from time to time. We will notify registered users via
            email for material changes and update the &ldquo;Last Updated&rdquo; date below.
            Continued use of our services after changes constitutes acceptance of the updated
            policy.
          </p>
        </MdxComponents>
      </Section>

      <Section title="11. Contact">
        <MdxComponents>
          <ul>
            <li>
              <strong>Privacy email:</strong> privacy@awfixer.me
            </li>
            <li>
              <strong>Data Protection Officer:</strong> dpo@awfixer.me
            </li>
            <li>
              <strong>Postal address:</strong> AWFixer Enterprising Inc, OSS Division
            </li>
          </ul>
        </MdxComponents>
      </Section>

      <div className="text-sm text-muted-foreground pt-6 border-t border-border">
        <p>
          <strong>Last Updated:</strong> May 2025
        </p>
        <p>
          <strong>Effective Date:</strong> May 2025
        </p>
      </div>
    </div>
  );
}

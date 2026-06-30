"use client";

import React from "react";
import { PageHeader, Section } from "@/app/shared/mdx-components";
import { MdxComponents } from "@/components/mdx-components";

export default function TermsContent() {
  return (
    <div>
      <PageHeader
        title="Terms of Service"
        description='These Terms of Service ("Terms") govern your use of the AWFixer Codes platform, including Grip, the AWFixer Codes Registry, and all related infrastructure services, operated by AWFixer Enterprising Inc, OSS Division ("AWFixer Codes", "we", "us", "our"). By using our services, you agree to these Terms.'
      />

      <Section title="1. Acceptance of Terms">
        <MdxComponents>
          <p>
            By creating an account or using any AWFixer Codes service, you confirm that you are at
            least 16 years of age and agree to be bound by these Terms, our{" "}
            <a href="/privacy">Privacy Policy</a>, and any applicable{" "}
            <a href="/agreements">agreements</a>.
          </p>
        </MdxComponents>
      </Section>

      <Section title="2. Service Description">
        <MdxComponents>
          <p>
            AWFixer Codes provides backend infrastructure for version control, package registries,
            CI/CD pipelines, and security services. Our services, including Grip, are provided as
            infrastructure — you are responsible for building and operating any frontends or
            user-facing applications that interact with our APIs.
          </p>
        </MdxComponents>
      </Section>

      <Section title="3. Account Registration">
        <MdxComponents>
          <ul>
            <li>You must provide accurate, complete information during registration.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>
              You must notify us immediately of any unauthorized access at security@awfixer.me.
            </li>
            <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
          </ul>
        </MdxComponents>
      </Section>

      <Section title="4. Acceptable Use">
        <MdxComponents>
          <p>You agree not to:</p>
          <ul>
            <li>Use the platform for any unlawful purpose or to distribute malicious software</li>
            <li>
              Attempt to gain unauthorized access to other users&apos; accounts or our systems
            </li>
            <li>Abuse rate limits, scrape content, or overwhelm our infrastructure</li>
            <li>Upload content that infringes others&apos; intellectual property rights</li>
            <li>Reverse-engineer, decompile, or disassemble any part of the platform</li>
            <li>Use automated systems to create accounts without our written permission</li>
          </ul>
        </MdxComponents>
      </Section>

      <Section title="5. Intellectual Property">
        <MdxComponents>
          <p>
            You retain ownership of all content you upload to or create on the platform. By
            publishing content on the AWFixer Codes Registry, you grant us a limited license to
            host, index, and serve that content as part of the platform&apos;s normal operation.
            This license is non-exclusive and terminates when you remove the content.
          </p>
          <p>
            The AWFixer Codes platform itself, including Grip, its APIs, and underlying software, is
            the property of AWFixer Enterprising Inc, OSS Division and is protected by applicable
            intellectual property laws.
          </p>
        </MdxComponents>
      </Section>

      <Section title="6. Service Availability">
        <MdxComponents>
          <p>
            We strive for 99.99% uptime but do not guarantee uninterrupted access. We reserve the
            right to modify, suspend, or discontinue any part of the service with reasonable notice.
            Scheduled maintenance windows are communicated in advance.
          </p>
        </MdxComponents>
      </Section>

      <Section title="7. Package Registry & Infrastructure">
        <MdxComponents>
          <p>
            The AWFixer Codes Registry and Grip infrastructure allow you to publish, distribute, and
            consume software packages and manage version control operations. By using these
            services:
          </p>
          <ul>
            <li>You represent that you have the rights to distribute any content you publish</li>
            <li>
              You acknowledge that published packages may be cached by mirrors and CDN nodes and may
              not be immediately deletable
            </li>
            <li>You are responsible for the security and quality of packages you publish</li>
            <li>
              We reserve the right to remove content that violates these Terms, contains malware, or
              compromises platform security
            </li>
          </ul>
        </MdxComponents>
      </Section>

      <Section title="8. Payment & Billing">
        <MdxComponents>
          <p>
            Paid plans are billed in advance. All fees are non-refundable except as required by law
            or as stated in our refund policy. We reserve the right to change pricing with 30
            days&apos; advance notice. Continued use after a price change constitutes acceptance.
          </p>
        </MdxComponents>
      </Section>

      <Section title="9. Termination">
        <MdxComponents>
          <p>
            You may terminate your account at any time. We may terminate or suspend accounts that
            violate these Terms, with or without notice depending on severity. Upon termination,
            your right to use the service ceases immediately. Provisions that by their nature should
            survive termination remain in effect.
          </p>
        </MdxComponents>
      </Section>

      <Section title="10. Limitation of Liability">
        <MdxComponents>
          <p>
            To the fullest extent permitted by law, AWFixer Codes shall not be liable for any
            indirect, incidental, special, consequential, or punitive damages, or any loss of
            profits or revenue, whether incurred directly or indirectly. Our total liability shall
            not exceed the amount you paid us in the 12 months preceding the claim.
          </p>
        </MdxComponents>
      </Section>

      <Section title="11. Indemnification">
        <MdxComponents>
          <p>
            You agree to indemnify and hold harmless AWFixer Enterprising Inc, OSS Division, its
            officers, directors, and employees from any claims, damages, or expenses arising from
            your use of the service or violation of these Terms.
          </p>
        </MdxComponents>
      </Section>

      <Section title="12. Governing Law">
        <MdxComponents>
          <p>
            These Terms are governed by the laws of the jurisdiction in which AWFixer Enterprising
            Inc, OSS Division is organized, without regard to conflict of law principles. Any
            disputes shall be resolved in the competent courts of that jurisdiction.
          </p>
        </MdxComponents>
      </Section>

      <Section title="13. Changes to Terms">
        <MdxComponents>
          <p>
            We may update these Terms from time to time. Material changes will be communicated via
            email and a notice on our website. Continued use of the service after changes become
            effective constitutes acceptance of the revised Terms.
          </p>
        </MdxComponents>
      </Section>

      <Section title="14. Contact">
        <MdxComponents>
          <ul>
            <li>
              <strong>Legal inquiries:</strong> legal@awfixer.me
            </li>
            <li>
              <strong>General support:</strong> codes@awfixer.me
            </li>
            <li>
              <strong>Security:</strong> security@awfixer.me
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

"use client";

import React from "react";
import { PageHeader, Section } from "@/app/shared/mdx-components";
import { MdxComponents } from "@/components/mdx-components";

export default function AboutContent() {
  return (
    <div>
      <PageHeader
        title="About AWFixer Codes"
        description="We build the infrastructure that lets teams create, ship, and scale with confidence. AWFixer Codes is the platform for developers who refuse to compromise on speed, security, or simplicity."
      />

      <Section title="Our Mission">
        <MdxComponents>
          <p>
            The developer tooling landscape is crowded with platforms that treat infrastructure as
            an afterthought — brittle defaults, opaque operations, and security bolted on as an
            afterthought. We started AWFixer Codes because we believe teams deserve better.
          </p>
          <p>
            Our mission is to eliminate the gap between &ldquo;it works on my machine&rdquo; and
            &ldquo;it works in production.&rdquo; Every feature we ship, every architecture decision
            we make, is in service of making the path from idea to deployment shorter, safer, and
            more reliable.
          </p>
        </MdxComponents>
      </Section>

      <Section title="What We Build">
        <MdxComponents>
          <p>
            AWFixer Codes provides backend infrastructure for version control, package registries,
            CI/CD pipelines, and security services. Our flagship product, <strong>Grip</strong>, is
            a next-generation package manager and registry built for speed and reliability.
          </p>
          <ul>
            <li>
              <strong>Grip Registry</strong> — Fast, secure package hosting with real-time indexing
              and global CDN distribution
            </li>
            <li>
              <strong>CI/CD Pipelines</strong> — Automated build, test, and deployment workflows
              that just work
            </li>
            <li>
              <strong>Security Scanning</strong> — Dependency auditing, vulnerability detection, and
              SBOM generation
            </li>
            <li>
              <strong>Infrastructure APIs</strong> — Programmatic access to every feature, designed
              for automation-first workflows
            </li>
          </ul>
        </MdxComponents>
      </Section>

      <Section title="Our Values">
        <MdxComponents>
          <ul>
            <li>
              <strong>Security First.</strong> Not a feature — the foundation. Zero-knowledge
              architecture, end-to-end encryption, and cryptographic guarantees from day one.
            </li>
            <li>
              <strong>Radical Transparency.</strong> Open source where it matters, clear about
              limitations, honest about trade-offs. No hidden telemetry, no dark patterns.
            </li>
            <li>
              <strong>Developer Experience.</strong> Every API, every CLI command, every workflow is
              designed for the developer who has to use it at 3 AM during an incident.
            </li>
            <li>
              <strong>Infrastructure as a Product.</strong> We provide the backbone. You build the
              experience. No lock-in, no opinionated frontends — just reliable, well-documented
              APIs.
            </li>
            <li>
              <strong>Ship Fast, Stay Stable.</strong> 99.99% uptime isn&apos;t aspirational —
              it&apos;s operational. Our chaos engineering program ensures reliability under
              real-world conditions.
            </li>
          </ul>
        </MdxComponents>
      </Section>

      <Section title="AWFixer Enterprising Inc, OSS Division">
        <MdxComponents>
          <p>
            AWFixer Codes is a project of <strong>AWFixer Enterprising Inc, OSS Division</strong>.
            We operate as an independent-minded team focused on open-source infrastructure and
            developer tooling. Our division mandate is simple: build tools we would want to use
            ourselves, and make them available to everyone.
          </p>
          <p>
            We invest 20% of engineering capacity in open-source contributions, security
            improvements, and technical debt reduction. Sustainable velocity isn&apos;t a slogan —
            it&apos;s how we run.
          </p>
        </MdxComponents>
      </Section>

      <div className="text-sm text-muted-foreground pt-6 border-t border-border mt-16">
        <p>
          <strong>Last Updated:</strong> May 2025
        </p>
      </div>
    </div>
  );
}

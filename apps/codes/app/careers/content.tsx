"use client";

import React from "react";
import { PageHeader, Section, StatCard } from "@/app/shared/mdx-components";
import { MdxComponents } from "@/components/mdx-components";

export default function CareersContent() {
  return (
    <div>
      <PageHeader
        title="Careers at AWFixer Codes"
        description="We're building infrastructure that developers trust with their most critical systems. If that sounds like the kind of problem you want to wake up and solve, we'd like to hear from you."
      />

      <Section title="Why AWFixer Codes">
        <MdxComponents>
          <p>
            We are a small, focused team that ships real infrastructure. No vanity projects, no
            feature theater, no meetings about meetings. Every line of code we write protects
            developer workflows that businesses depend on.
          </p>
          <p>
            We invest 20% of engineering time in security, open-source contributions, and technical
            debt — not as an afterthought, but because sustainable velocity is a competitive
            advantage.
          </p>
        </MdxComponents>
      </Section>

      <Section title="By the Numbers">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Engineering % of Team" value="80%" trend="up" />
          <StatCard label="Open Source Contributions" value="200+" trend="up" />
          <StatCard label="Uptime (12 months)" value="99.97%" trend="up" />
          <StatCard label="Mean Time to Respond" value="< 15 min" trend="up" />
        </div>
      </Section>

      <Section title="Open Positions">
        <MdxComponents>
          <p>
            We hire for capability and character. If you see a role that fits, apply. If you
            don&apos;t see a role but think you belong here, reach out anyway.
          </p>
        </MdxComponents>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">Senior Backend Engineer</h3>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                Hiring
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Design and build the core infrastructure powering our registry, CI/CD pipeline, and
              security scanning services. TypeScript, Rust, or Go. Remote-first.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                TypeScript
              </span>
              <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                Rust
              </span>
              <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                PostgreSQL
              </span>
              <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                Remote
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">Security Engineer</h3>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-400">
                Hiring
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Own our security posture end-to-end: threat modeling, dependency auditing, penetration
              testing, incident response. You are the reason our customers sleep well.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                Security
              </span>
              <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                OWASP
              </span>
              <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                Cryptography
              </span>
              <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                Remote
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-foreground">Developer Advocate</h3>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Bridge the gap between our engineering team and the developer community. Write docs,
              build examples, run workshops, and make sure every developer interaction with AWFixer
              Codes is excellent.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                Developer Relations
              </span>
              <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                Content
              </span>
              <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                Community
              </span>
              <span className="px-2 py-0.5 text-xs rounded bg-muted text-muted-foreground">
                Remote
              </span>
            </div>
          </div>
        </div>
      </Section>

      <Section title="What We Offer">
        <MdxComponents>
          <ul>
            <li>
              <strong>Remote-first.</strong> Work from wherever you do your best work. Async by
              default, synchronous when it matters.
            </li>
            <li>
              <strong>Competitive compensation.</strong> Market-rate salaries with equity. No
              lowball offers, no negotiation games.
            </li>
            <li>
              <strong>Hardware budget.</strong> $3,000/year for equipment, learning materials, and
              professional development.
            </li>
            <li>
              <strong>Unlimited PTO.</strong> We track output, not hours. Take the time you need,
              communicate clearly, deliver results.
            </li>
            <li>
              <strong>20% time.</strong> Dedicated time for security improvements, open-source
              contributions, and tech debt — built into our sprints, not squeezed around the edges.
            </li>
            <li>
              <strong>Real incidents, real learning.</strong> Postmortems are blameless. We run
              chaos engineering weekly. If you want to grow, this is the place.
            </li>
          </ul>
        </MdxComponents>
      </Section>

      <Section title="How to Apply">
        <MdxComponents>
          <p>
            Send your resume, a link to something you&apos;ve built, and a brief note on why AWFixer
            Codes interests you to <strong>careers@awfixer.me</strong>. No cover letter templates.
            No leetcode grinds. Just tell us what you&apos;ve done and what you want to do next.
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

"use client";

import { CLink as Link } from "@awfixersites/telemetry/link";
import { ArrowUpRight, Landmark, Layers3, LineChart, ShieldCheck } from "lucide-react";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";
import { showPortfolioHighlight } from "@/lib/flags";
import { portfolioCompanies } from "@/lib/portfolio";

const tickerItems = [
  "Oversight",
  "Administration",
  "Governance",
  "Operations",
  "Compliance",
  "Stewardship",
  "Infrastructure",
  "Continuity",
] as const;

const pillars = [
  {
    title: "Mandate",
    body: "We hold the line between mission and machinery — so every arm of the Church can move without losing its center.",
    icon: Landmark,
  },
  {
    title: "Oversight",
    body: "Structured review, clear accountability, and reporting that leadership can act on — not noise.",
    icon: ShieldCheck,
  },
  {
    title: "Operations",
    body: "Finance, legal coordination, vendor management, and the unglamorous work that keeps institutions durable.",
    icon: Layers3,
  },
  {
    title: "Scale",
    body: "Systems that grow with the portfolio: repeatable process, measured risk, and room to flex when it counts.",
    icon: LineChart,
  },
] as const;

const homePortfolio = portfolioCompanies.slice(0, 4);

const metrics = [
  { label: "Function", value: "Management" },
  { label: "Scope", value: "Church + orgs" },
  { label: "Posture", value: "Oversight-first" },
  { label: "Reach", value: "Multi-entity" },
] as const;

export default async function Page() {
  const highlightPortfolio = await showPortfolioHighlight();

  return (
    <div className="flex flex-col">
      <section className="relative flex min-h-[calc(100svh-4rem)] flex-col justify-center overflow-hidden px-6 py-24 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-steel-muted/20 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-12">
          <Reveal immediate delay={0}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-glass-border bg-glass px-3 py-1 font-mono text-[10px] tracking-[0.35em] text-steel-bright uppercase backdrop-blur-sm">
                Administrative division
              </span>
              <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
                AWFixer Church ecosystem
              </span>
            </div>
          </Reveal>

          <Reveal immediate delay={0.08}>
            <h1 className="max-w-4xl font-display text-4xl leading-[1.05] text-off-white sm:text-5xl lg:text-7xl">
              The steel behind
              <span className="block text-steel-bright">the mission.</span>
            </h1>
          </Reveal>

          <Reveal immediate delay={0.16}>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
              AWFixer LLC is the management, administration, and oversight division of
              AWFixer&apos;s Church and church-owned organizations and businesses. We run the
              backbone — so the work in front of the world stays sharp.
            </p>
          </Reveal>

          <Reveal immediate delay={0.24}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="#mandate"
                className="inline-flex items-center justify-center rounded-full border border-off-white/20 bg-off-white px-8 py-3.5 text-xs font-mono tracking-[0.2em] text-primary-foreground uppercase transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Read the mandate
              </Link>
              <Link
                href="https://awfixer.church"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-glass-border px-8 py-3.5 text-xs font-mono tracking-[0.2em] text-off-white uppercase backdrop-blur-sm transition-colors hover:border-steel-bright/40"
              >
                The Church
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal immediate delay={0.32}>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-glass-border bg-glass-border sm:grid-cols-4">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex flex-col gap-1 bg-background/60 px-5 py-4 backdrop-blur-sm"
                >
                  <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                    {m.label}
                  </span>
                  <span className="font-display text-sm text-off-white sm:text-base">
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="relative z-10 mt-16 overflow-hidden border-y border-glass-border py-4">
          <div className="ticker-track gap-12 px-6 font-mono text-[11px] tracking-[0.3em] text-muted-foreground/90 uppercase">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={`${item}-${i}`} className="flex shrink-0 items-center gap-12">
                {item}
                <span className="h-1 w-1 rounded-full bg-steel-bright/60" aria-hidden />
              </span>
            ))}
          </div>
        </div>
      </section>

      <section
        id="mandate"
        className="section-auto border-t border-glass-border px-6 py-24 lg:py-32"
      >
        <div className="mx-auto grid max-w-[1200px] gap-16 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <p className="mb-4 font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
              Mandate
            </p>
            <h2 className="font-display text-3xl leading-tight text-off-white lg:text-4xl">
              Administration is not an afterthought. It is the frame.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
              <p>
                Institutions that matter need more than vision — they need custody. AWFixer LLC
                exists to steward legal entities, operational cadence, and executive visibility
                across the Church and the businesses it owns.
              </p>
              <p>
                This site is deliberate posture: dark steel, clear lines, motion with restraint.
                Performance is part of the flex — nothing here should tax the machine that runs it.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="oversight"
        className="section-auto border-t border-glass-border px-6 py-24 lg:py-32"
      >
        <div className="mx-auto max-w-[1200px]">
          <Reveal className="mb-14 max-w-2xl">
            <p className="mb-4 font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
              Oversight
            </p>
            <h2 className="font-display text-3xl text-off-white lg:text-4xl">
              Four load-bearing pillars
            </h2>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2">
            {pillars.map((pillar, i) => (
              <Reveal key={pillar.title} delay={0.06 * i}>
                <article
                  className={cn(
                    "panel-steel group flex h-full flex-col gap-4 rounded-2xl p-8 transition-transform duration-300 hover:-translate-y-0.5",
                  )}
                >
                  <pillar.icon className="h-5 w-5 text-steel-bright" strokeWidth={1.5} />
                  <h3 className="font-display text-xl text-off-white">{pillar.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
                  <div className="stat-line mt-auto w-full opacity-60" />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="portfolio"
        className={cn(
          "section-auto border-t border-glass-border px-6 py-24 lg:py-32",
          highlightPortfolio && "bg-steel-muted/10",
        )}
      >
        <div className="mx-auto max-w-[1200px]">
          <Reveal className="mb-14 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-4 font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
                Portfolio
              </p>
              <h2 className="font-display text-3xl text-off-white lg:text-4xl">
                Entities under the same roof
              </h2>
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              Select arms of the ecosystem. LLC provides the connective tissue — not the pulpit, not
              the product, but the governance that lets both breathe.
            </p>
          </Reveal>

          <PortfolioGrid companies={homePortfolio} />

          <Reveal className="mt-12 text-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-full border border-glass-border px-8 py-3.5 font-mono text-xs tracking-[0.2em] text-off-white uppercase transition-colors hover:border-steel-bright/40"
            >
              Full portfolio
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      <section
        id="contact"
        className="section-auto border-t border-glass-border px-6 py-24 lg:py-32"
      >
        <div className="mx-auto max-w-[900px] text-center">
          <Reveal>
            <p className="mb-4 font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
              Contact
            </p>
            <h2 className="mb-6 font-display text-3xl text-off-white lg:text-5xl">
              Serious inquiries only.
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-muted-foreground">
              For governance, partnership, or administrative matters across AWFixer entities.
            </p>
            <a
              href="mailto:developers@awfixer.llc"
              className="inline-flex items-center gap-2 rounded-full border border-steel-bright/35 bg-steel-muted/30 px-10 py-4 font-mono text-xs tracking-[0.25em] text-off-white uppercase backdrop-blur-sm transition-transform hover:scale-[1.02]"
            >
              developers@awfixer.llc
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

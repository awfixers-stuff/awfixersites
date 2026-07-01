import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PortfolioGrid } from "@/components/portfolio-grid";
import { AWFIXER_X_URL } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Church-owned organizations and businesses under management and oversight by AWFixer LLC.",
  openGraph: {
    title: "Portfolio | AWFixer LLC",
    description:
      "Entities stewarded under AWFixer LLC — management, administration, and oversight.",
  },
};

export default function PortfolioPage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-glass-border px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase transition-colors hover:text-off-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            AWFixer LLC
          </Link>

          <p className="mb-4 font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
            Portfolio
          </p>
          <h1 className="max-w-3xl font-display text-4xl leading-tight text-off-white lg:text-5xl">
            Companies under one governance fabric
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            AWFixer LLC provides management, administration, and oversight across AWFixer&apos;s
            Church and the organizations and businesses it owns. This is the operating map — not an
            exhaustive SEC filing, but the shape of what we steward.
          </p>

          <a
            href={AWFIXER_X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass px-6 py-3 font-mono text-xs tracking-widest text-off-white uppercase backdrop-blur-sm transition-colors hover:border-steel-bright/40"
          >
            @awfixers
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="section-auto px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <PortfolioGrid showRole />
        </div>
      </section>
    </div>
  );
}

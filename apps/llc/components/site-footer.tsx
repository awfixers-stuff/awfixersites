"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-glass-border">
      <div className="absolute top-0 left-1/2 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-steel-bright/35 to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-20 lg:px-12 lg:py-24">
        <Reveal className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="mb-3 font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
              AWFixer LLC
            </p>
            <p className="max-w-xl font-display text-2xl leading-snug text-off-white lg:text-3xl">
              Management, administration, and oversight for the Church and every organization it
              stewards.
            </p>
          </div>

          <div className="flex flex-col justify-between gap-8 lg:col-span-5">
            <div className="flex flex-col gap-3">
              <a
                href="mailto:developers@awfixer.llc"
                className="group inline-flex items-center gap-2 font-mono text-sm text-off-white transition-colors hover:text-steel-bright"
              >
                developers@awfixer.llc
                <ArrowUpRight className="h-4 w-4 opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <Link
                href="https://awfixer.church"
                className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-off-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                AWFixer&apos;s Church
                <ArrowUpRight className="h-3.5 w-3.5 opacity-40" />
              </Link>
              <Link
                href="/portfolio"
                className="text-sm text-muted-foreground transition-colors hover:text-off-white"
              >
                Portfolio
              </Link>
            </div>
            <p className="font-mono text-[10px] leading-relaxed tracking-wider text-muted-foreground/80 uppercase">
              Delaware limited liability company · Administrative arm · Not a public solicitation
            </p>
          </div>
        </Reveal>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-glass-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {year} AWFixer LLC. All rights reserved.
          </p>
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground/70 uppercase">
            Built for operational clarity
          </p>
        </div>
      </div>
    </footer>
  );
}
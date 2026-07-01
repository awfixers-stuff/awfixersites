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
              AWFixer Legal
            </p>
            <p className="max-w-xl font-display text-2xl leading-snug text-off-white lg:text-3xl">
              Canonical policies and disclosures for every AWFixer property.
            </p>
          </div>

          <div className="flex flex-col justify-between gap-8 lg:col-span-5">
            <div className="flex flex-col gap-3">
              <a
                href="mailto:legal@awfixer.me"
                className="group inline-flex items-center gap-2 font-mono text-sm text-off-white transition-colors hover:text-steel-bright"
              >
                legal@awfixer.me
                <ArrowUpRight className="h-4 w-4 opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground transition-colors hover:text-off-white"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground transition-colors hover:text-off-white"
              >
                Terms
              </Link>
              <Link
                href="/legal"
                className="text-sm text-muted-foreground transition-colors hover:text-off-white"
              >
                Nonprofit disclosures
              </Link>
            </div>
            <p className="font-mono text-[10px] leading-relaxed tracking-wider text-muted-foreground/80 uppercase">
              legal.awfixer.llc · Not legal advice
            </p>
          </div>
        </Reveal>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-glass-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {year} AWFixer LLC. Policies apply to properties we operate.
          </p>
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground/70 uppercase">
            Steel theme · Domain ownership
          </p>
        </div>
      </div>
    </footer>
  );
}

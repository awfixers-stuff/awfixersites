"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Clock, HeartHandshake } from "lucide-react";

export default function DonationsPage() {
  return (
    <div className="flex flex-col">
      {/* ============================================================ */}
      {/* Page header                                                 */}
      {/* ============================================================ */}
      <section className="relative px-6 pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bleach/30 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-[800px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 180, damping: 24, mass: 0.8 }}
          >
            <div className="mb-6 inline-flex items-center gap-3 text-xs font-mono text-foreground/40 uppercase tracking-widest">
              <span className="w-6 h-px bg-foreground/20" />
              Donations
              <span className="w-6 h-px bg-foreground/20" />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass backdrop-blur-sm px-4 py-1.5 text-xs font-mono text-foreground/50 mb-6">
              <Clock className="w-3.5 h-3.5" />
              Coming soon
            </div>

            <h1 className="text-4xl lg:text-5xl font-display leading-tight mb-6">
              Support the mission
            </h1>

            <p className="text-lg text-foreground/60 leading-relaxed max-w-lg mx-auto">
              AWFixer&rsquo;s Church is a 501(c)(3) certified nonprofit organization. We&rsquo;re
              putting the final touches on our giving portal.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Details                                                     */}
      {/* ============================================================ */}
      <section className="px-6 py-28 lg:py-36 border-t border-glass-border section-auto">
        <div className="max-w-[800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-display leading-tight mb-8">What to know</h2>

            <div className="space-y-6">
              <div className="rounded-2xl border border-glass-border bg-glass backdrop-blur-sm p-7">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-foreground/50" />
                  501(c)(3) Certified
                </h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  AWFixer&rsquo;s Church is recognized by the IRS as a 501(c)(3) nonprofit
                  organization. Your contributions directly support the church&rsquo;s mission — the
                  ongoing inquiry into the question on which the world was founded.
                </p>
              </div>

              <div className="rounded-2xl border border-glass-border bg-glass backdrop-blur-sm p-7">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-foreground/50" />
                  Tax Deductible
                </h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  All donations to AWFixer&rsquo;s Church are tax-deductible to the fullest extent
                  allowed by law. You will receive a receipt for your records at the time of
                  donation.
                </p>
              </div>

              <div className="rounded-2xl border border-glass-border bg-glass backdrop-blur-sm p-7">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-foreground/50" />
                  How your gift helps
                </h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  Every contribution goes toward building and sustaining the church — maintaining
                  this website, supporting our community, funding our outreach, and equipping those
                  who carry the question into the world.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Stay tuned                                                  */}
      {/* ============================================================ */}
      <section className="px-6 py-28 lg:py-36 border-t border-glass-border bg-bleach/30 section-auto">
        <div className="max-w-[800px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-foreground/40 uppercase tracking-widest">
              <span className="w-6 h-px bg-foreground/20" />
              Stay Tuned
            </div>

            <h2 className="text-3xl lg:text-4xl font-display leading-tight mb-4">
              Giving portal coming soon
            </h2>

            <p className="text-foreground/60 leading-relaxed max-w-md mx-auto mb-8">
              We&rsquo;re building a secure way for you to contribute. In the meantime, if you have
              questions, feel free to reach out.
            </p>

            <Link
              href="/contact"
              className={cn(
                "inline-flex items-center justify-center rounded-full h-12 px-8 text-sm font-bold uppercase tracking-wider gap-2",
                "bg-foreground text-background hover:brightness-110",
                "shadow-[0_6px_0_0_oklch(0.2_0_0)] active:shadow-none active:translate-y-[4px]",
                "transition-all duration-100 ease-out btn-glow",
              )}
            >
              Contact us
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Bottom CTA — back to the question                           */}
      {/* ============================================================ */}
      <section className="px-6 pb-28 lg:pb-36 section-auto">
        <div className="max-w-[800px] mx-auto text-center pt-20 lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          >
            <h2 className="text-2xl lg:text-3xl font-display leading-tight mb-6">
              The question is what matters
            </h2>
            <p className="text-foreground/60 leading-relaxed mb-8 max-w-md mx-auto">
              Before the giving, before the building — there is the question. Return to it whenever
              you need.
            </p>

            <Link
              href="/"
              className={cn(
                "inline-flex items-center justify-center rounded-full h-12 px-8 text-sm font-medium",
                "border border-foreground/20 text-foreground/80 hover:bg-foreground/5 transition-colors btn-glow",
              )}
            >
              Back to the question
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

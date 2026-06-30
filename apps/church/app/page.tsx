"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ChurchIcon } from "@/components/church-icon";
import { cn } from "@/lib/utils";

export default function Page() {
  return (
    <div className="flex flex-col">
      {/* ============================================================ */}
      {/* Hero — church pixel art + core question                     */}
      {/* ============================================================ */}
      <section className="relative flex flex-col items-center justify-center min-h-svh px-6 py-32 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bleach/30 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl gap-8">
          {/* Pixel church icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 150, damping: 20, mass: 1.2 }}
            className="w-28 sm:w-36 md:w-44 mb-2"
          >
            <ChurchIcon />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-display leading-tight max-w-2xl"
          >
            On what principle
            <br />
            was the world founded?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg text-foreground/60 max-w-lg leading-relaxed"
          >
            A question that doesn&rsquo;t presume where you start, what you believe, or what
            you&rsquo;ve been through. We meet you where you are.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mt-4"
          >
            <Link
              href="/#our-question"
              className={cn(
                "inline-flex items-center justify-center rounded-full h-12 px-8 text-sm font-bold uppercase tracking-wider",
                "bg-foreground text-background hover:brightness-110",
                "shadow-[0_6px_0_0_oklch(0.2_0_0)] active:shadow-none active:translate-y-[4px]",
                "transition-all duration-100 ease-out btn-glow",
              )}
            >
              Explore the Question
            </Link>
            <Link
              href="/#principles"
              className={cn(
                "inline-flex items-center justify-center rounded-full h-12 px-8 text-sm font-medium",
                "border border-foreground/20 text-foreground/80 hover:bg-foreground/5 transition-colors btn-glow",
              )}
            >
              Our Principles
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Our Question section                                        */}
      {/* ============================================================ */}
      <section
        id="our-question"
        className="px-6 py-28 lg:py-36 border-t border-glass-border section-auto"
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 180, damping: 24 }}
            >
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-foreground/40 uppercase tracking-widest">
                <span className="w-6 h-px bg-foreground/20" />
                The question
              </div>
              <h2 className="text-3xl lg:text-4xl font-display leading-tight mb-6">
                A first principle, not a doctrine
              </h2>
              <p className="text-base lg:text-lg text-foreground/65 leading-relaxed">
                Every framework, every belief system, every institution stands on some foundational
                claim about reality. We believe the most honest stance is to surface that claim and
                interrogate it together — not to replace one dogma with another.
              </p>
              <p className="text-base lg:text-lg text-foreground/65 leading-relaxed mt-4">
                &ldquo;On what principle was the world founded?&rdquo; is not rhetorical. It is an
                invitation to examine the axioms underneath your worldview — and to respect that
                everyone else is doing the same from wherever they stand.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 24 }}
              className="bg-glass backdrop-blur-sm border border-glass-border rounded-2xl p-8 lg:p-10 container-glow"
            >
              <div className="text-5xl font-display leading-none mb-6 text-foreground/10 select-none">
                &ldquo;
              </div>
              <p className="text-lg lg:text-xl leading-relaxed text-foreground/80">
                The question matters more than the answer you arrive at. A church that hands you
                conclusions has failed you. A church that teaches you to ask better questions has
                begun.
              </p>
              <div className="mt-6 pt-6 border-t border-glass-border text-sm text-foreground/40">
                — A first principle
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Principles section                                         */}
      {/* ============================================================ */}
      <section
        id="principles"
        className="px-6 py-28 lg:py-36 border-t border-glass-border bg-bleach/30 section-auto"
      >
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
            className="text-center max-w-2xl mx-auto mb-20"
          >
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-foreground/40 uppercase tracking-widest">
              <span className="w-6 h-px bg-foreground/20" />
              Principles
            </div>
            <h2 className="text-3xl lg:text-4xl font-display leading-tight mb-4">
              How we approach the question
            </h2>
            <p className="text-foreground/60 leading-relaxed">Not a creed. A method.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Start Where You Are",
                description:
                  "No prerequisites, no gatekeeping. Your current framework — scientific, spiritual, skeptical — is a valid starting point. We don't ask you to shed it; we ask you to examine it.",
              },
              {
                title: "Judge Nothing, Question Everything",
                description:
                  "Judgment forecloses inquiry. We take a clinical, scientific posture toward every claim: what's the evidence? What's the axiom? What breaks if we change it?",
              },
              {
                title: "Build Together",
                description:
                  "This isn't solitary contemplation. The question is meant to be held in community — tested, refined, and passed along. A principle you can't explain to a stranger isn't a principle yet.",
              },
            ].map((principle, i) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 180, damping: 24 }}
                className="bg-glass backdrop-blur-sm border border-glass-border rounded-2xl p-8 container-glow"
              >
                <div className="text-xs font-mono text-foreground/30 mb-4">
                  {(i + 1).toString().padStart(2, "0")}
                </div>
                <h3 className="text-xl font-display mb-3">{principle.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">
                  {principle.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Community section                                          */}
      {/* ============================================================ */}
      <section
        id="community"
        className="px-6 py-28 lg:py-36 border-t border-glass-border section-auto"
      >
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-foreground/40 uppercase tracking-widest">
              <span className="w-6 h-px bg-foreground/20" />
              Community
            </div>
            <h2 className="text-3xl lg:text-4xl font-display leading-tight mb-6 max-w-2xl mx-auto">
              You don&rsquo;t have to figure it out alone
            </h2>
            <p className="text-lg text-foreground/60 max-w-lg mx-auto leading-relaxed mb-12">
              Join others who are asking the same question — from every background, every tradition,
              every doubt.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="https://x.com/AWFixerChurch"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center justify-center rounded-full h-12 px-8 text-sm font-bold uppercase tracking-wider",
                  "bg-foreground text-background hover:brightness-110",
                  "shadow-[0_6px_0_0_oklch(0.2_0_0)] active:shadow-none active:translate-y-[4px]",
                  "transition-all duration-100 ease-out btn-glow",
                )}
              >
                Follow on X
              </Link>
              <Link
                href="/contact"
                className={cn(
                  "inline-flex items-center justify-center rounded-full h-12 px-8 text-sm font-medium",
                  "border border-foreground/20 text-foreground/80 hover:bg-foreground/5 transition-colors btn-glow",
                )}
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA section                                                */}
      {/* ============================================================ */}
      <section
        id="join"
        className="px-6 py-28 lg:py-36 border-t border-glass-border bg-bleach/30 section-auto"
      >
        <div className="max-w-[800px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-foreground/40 uppercase tracking-widest">
              <span className="w-6 h-px bg-foreground/20" />
              Join the question
            </div>
            <h2 className="text-3xl lg:text-5xl font-display leading-tight mb-6">Ready to ask?</h2>
            <p className="text-lg text-foreground/60 max-w-lg mx-auto leading-relaxed mb-10">
              No membership. No creed. Just a question and people willing to sit with it.
            </p>

            <Link
              href="#our-question"
              className={cn(
                "inline-flex items-center justify-center rounded-full h-14 px-10 text-base font-bold uppercase tracking-wider",
                "bg-foreground text-background hover:brightness-110",
                "shadow-[0_8px_0_0_oklch(0.2_0_0)] active:shadow-none active:translate-y-[6px]",
                "transition-all duration-100 ease-out btn-glow",
              )}
            >
              On what principle was the world founded?
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

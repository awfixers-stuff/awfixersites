"use client";

import { motion } from "motion/react";
import { CLink as Link } from "@awfixersites/telemetry/link";
import { cn } from "@/lib/utils";

export default function PhilosophyPage() {
  return (
    <div className="flex flex-col">
      {/* ============================================================ */}
      {/* Hero — the quote, full screen                              */}
      {/* ============================================================ */}
      <section className="relative flex flex-col items-center justify-center min-h-svh px-6 py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bleach/30 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl gap-10">
          {/* Decorative opening mark */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 1 }}
            className="text-7xl lg:text-9xl font-display leading-none text-foreground/5 select-none pointer-events-none"
            aria-hidden
          >
            &ldquo;
          </motion.span>

          {/* The quote */}
          <motion.blockquote
            initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.25, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-3xl sm:text-4xl lg:text-6xl font-display leading-tight text-foreground/90">
              Present or absent,
              <br />
              we wrestle with God.
            </p>
          </motion.blockquote>

          {/* Attribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-2"
          >
            <span className="w-8 h-px bg-foreground/20" />
            <cite className="text-sm text-foreground/40 not-italic font-mono">
              Dr. Jordan B. Peterson
            </cite>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute bottom-10 flex flex-col items-center gap-2 text-xs text-foreground/20 font-mono"
          >
            <span className="w-px h-8 bg-foreground/10" />
            scroll
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* What this means for us                                     */}
      {/* ============================================================ */}
      <section className="px-6 py-28 lg:py-36 border-t border-glass-border section-auto">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-foreground/40 uppercase tracking-widest">
              <span className="w-6 h-px bg-foreground/20" />
              The wrestle
            </div>

            <h2 className="text-2xl lg:text-3xl font-display leading-tight mb-8">
              The question implies a wrestler
            </h2>

            <div className="space-y-5 text-base lg:text-lg text-foreground/65 leading-relaxed">
              <p>
                To ask &ldquo;on what principle was the world founded?&rdquo; is already to grapple.
                The question does not permit a detached observer &mdash; it demands that you locate
                yourself relative to the answer. You are either in relation to the ground of being
                or you are not; there is no neutral position.
              </p>
              <p>
                Peterson&rsquo;s formulation captures this elegantly: whether you affirm or deny,
                whether you seek or ignore, the confrontation with the fundamental structure of
                reality is inescapable. The atheist and the believer alike are locked in the same
                struggle &mdash; one names the opponent, the other refuses to, but both are engaged.
              </p>
              <p>
                This is not a call to belief. It is an acknowledgment that the stance you take
                toward the deepest questions is itself the shape of your character. The wrestle is
                not optional; only the awareness of it is.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Two columns — wrestling / presence                         */}
      {/* ============================================================ */}
      <section className="px-6 py-28 lg:py-36 border-t border-glass-border bg-bleach/30 section-auto">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ type: "spring", stiffness: 180, damping: 24 }}
              className="bg-glass backdrop-blur-sm border border-glass-border rounded-2xl p-8 lg:p-10 container-glow"
            >
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-foreground/30 uppercase tracking-widest">
                <span className="w-4 h-px bg-foreground/10" />
                Present
              </div>
              <h3 className="text-xl lg:text-2xl font-display mb-4">To wrestle in faith</h3>
              <p className="text-sm lg:text-base text-foreground/60 leading-relaxed">
                To affirm that the principle exists and is worth seeking. This is the posture of the
                believer, the mystic, the philosopher who assumes order is discoverable. The risk is
                naive certainty. The reward is coherent action.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: 0.1, type: "spring", stiffness: 180, damping: 24 }}
              className="bg-glass backdrop-blur-sm border border-glass-border rounded-2xl p-8 lg:p-10 container-glow"
            >
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-foreground/30 uppercase tracking-widest">
                <span className="w-4 h-px bg-foreground/10" />
                Absent
              </div>
              <h3 className="text-xl lg:text-2xl font-display mb-4">To wrestle in doubt</h3>
              <p className="text-sm lg:text-base text-foreground/60 leading-relaxed">
                To deny or suspend judgment on the principle, yet still be shaped by the denial. The
                atheist, the skeptic, the materialist &mdash; each takes a position relative to the
                question, and that position organizes their life. The risk is unrecognized faith.
                The reward is intellectual honesty.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 24 }}
            className="mt-10 text-center"
          >
            <p className="text-sm text-foreground/40 max-w-lg mx-auto leading-relaxed">
              Neither posture escapes the wrestle. The only freedom is in choosing to wrestle
              consciously.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Connection to the question                                 */}
      {/* ============================================================ */}
      <section className="px-6 py-28 lg:py-36 border-t border-glass-border section-auto">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-foreground/40 uppercase tracking-widest">
              <span className="w-6 h-px bg-foreground/20" />
              The question
            </div>

            <h2 className="text-2xl lg:text-3xl font-display leading-tight mb-6">
              One question, one wrestle
            </h2>

            <p className="text-base lg:text-lg text-foreground/65 leading-relaxed mb-8">
              &ldquo;On what principle was the world founded?&rdquo; and &ldquo;Present or absent,
              we wrestle with God&rdquo; are the same statement in different keys. One asks about
              the nature of reality; the other names the inescapable posture of the one who asks.
            </p>

            <div className="bg-glass backdrop-blur-sm border border-glass-border rounded-2xl p-8 lg:p-10 container-glow">
              <p className="text-lg lg:text-xl font-display leading-relaxed text-foreground/70">
                The question is the wrestle. The wrestle is the question.
              </p>
              <div className="mt-6 pt-6 border-t border-glass-border text-sm text-foreground/40">
                There is nowhere else to stand.
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Back to the question CTA                                   */}
      {/* ============================================================ */}
      <section className="px-6 py-20 lg:py-28 border-t border-glass-border bg-bleach/30 section-auto">
        <div className="max-w-[800px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          >
            <h2 className="text-2xl lg:text-3xl font-display leading-tight mb-6">
              Continue the wrestle
            </h2>
            <p className="text-foreground/60 leading-relaxed mb-8 max-w-md mx-auto">
              The philosophy lives inside the question. Return to it, or reach out.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className={cn(
                  "inline-flex items-center justify-center rounded-full h-12 px-8 text-sm font-bold uppercase tracking-wider",
                  "bg-foreground text-background hover:brightness-110",
                  "shadow-[0_6px_0_0_oklch(0.2_0_0)] active:shadow-none active:translate-y-[4px]",
                  "transition-all duration-100 ease-out btn-glow",
                )}
              >
                The founding question
              </Link>
              <Link
                href="/contact"
                className={cn(
                  "inline-flex items-center justify-center rounded-full h-12 px-8 text-sm font-medium",
                  "border border-foreground/20 text-foreground/80 hover:bg-foreground/5 transition-colors btn-glow",
                )}
              >
                Reach the movement
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

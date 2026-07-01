"use client";

import { motion } from "motion/react";
import { CLink as Link } from "@awfixersites/telemetry/link";
import { Mail, MessageSquare, Flag, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactChannel {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  note?: string;
}

const channels: ContactChannel[] = [
  {
    label: "contact@awfixer.church",
    description: "General inquiries about the church, our question, or getting involved.",
    href: "mailto:contact@awfixer.church",
    icon: <Mail className="w-5 h-5" />,
  },
  {
    label: "tips@awfixer.news",
    description: "Have a story, a lead, or something the world should know? Send it here.",
    href: "mailto:tips@awfixer.news",
    icon: <MessageSquare className="w-5 h-5" />,
    note: "Confidentiality respected.",
  },
  {
    label: "contact@awfixer.party",
    description:
      "Political engagement, policy positions, and supporting our movement in the public square.",
    href: "mailto:contact@awfixer.party",
    icon: <Flag className="w-5 h-5" />,
  },
  {
    label: "awfixer.army",
    description: "Enlist. Train. Serve. Join the disciplined body that puts principle into action.",
    href: "https://awfixer.army",
    icon: <Users className="w-5 h-5" />,
    note: "Opens in new tab",
  },
];

export default function ContactPage() {
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
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-foreground/40 uppercase tracking-widest">
              <span className="w-6 h-px bg-foreground/20" />
              Contact
            </div>

            <h1 className="text-4xl lg:text-5xl font-display leading-tight mb-6">
              Reach the movement
            </h1>

            <p className="text-lg text-foreground/60 leading-relaxed max-w-lg mx-auto">
              Every channel serves a different purpose. Pick the one that fits what you&rsquo;re
              bringing — an inquiry, a tip, a political question, or yourself.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Contact channels grid                                       */}
      <section className="px-6 pb-28 lg:pb-36 section-auto">
        <div className="max-w-[1000px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {channels.map((ch, i) => (
              <motion.a
                key={ch.label}
                href={ch.href}
                target={ch.href.startsWith("http") ? "_blank" : undefined}
                rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 200, damping: 24 }}
                className={cn(
                  "group relative flex flex-col gap-3 rounded-2xl border border-glass-border bg-glass backdrop-blur-sm p-7",
                  "hover:border-foreground/20 transition-all duration-300 container-glow",
                )}
              >
                {/* Icon */}
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-foreground/5 text-foreground/60 group-hover:text-foreground/80 transition-colors">
                    {ch.icon}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-mono tracking-tight text-foreground/80",
                      "group-hover:text-foreground transition-colors",
                    )}
                  >
                    {ch.label}
                  </span>
                </div>

                <p className="text-sm text-foreground/50 leading-relaxed">{ch.description}</p>

                {ch.note && <span className="text-xs text-foreground/30 font-mono">{ch.note}</span>}
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Follow / Social section                                     */}
      {/* ============================================================ */}
      <section className="px-6 pb-28 lg:pb-36 border-t border-glass-border bg-bleach/30 section-auto">
        <div className="max-w-[800px] mx-auto text-center pt-20 lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-foreground/40 uppercase tracking-widest">
              <span className="w-6 h-px bg-foreground/20" />
              Follow
            </div>

            <h2 className="text-3xl lg:text-4xl font-display leading-tight mb-4">
              Follow on social media
            </h2>
            <p className="text-foreground/60 leading-relaxed mb-8">
              Updates, discussions, and the question in motion.
            </p>

            <a
              href="https://x.com/AWFixerChurch"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center justify-center rounded-full h-12 px-8 text-sm font-bold uppercase tracking-wider gap-2",
                "bg-foreground text-background hover:brightness-110",
                "shadow-[0_6px_0_0_oklch(0.2_0_0)] active:shadow-none active:translate-y-[4px]",
                "transition-all duration-100 ease-out btn-glow",
              )}
            >
              @AWFixerChurch
            </a>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Bottom CTA — back to the question                           */}
      {/* ============================================================ */}
      <section className="px-6 pb-28 lg:pb-36 section-auto">
        <div className="max-w-[800px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          >
            <h2 className="text-2xl lg:text-3xl font-display leading-tight mb-6">
              Still have the question?
            </h2>
            <p className="text-foreground/60 leading-relaxed mb-8 max-w-md mx-auto">
              The question is always open. Come back to it whenever you&rsquo;re ready.
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

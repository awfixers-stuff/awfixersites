"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GraduationCap, Shield, Briefcase, Newspaper, Heart, UserCircle } from "lucide-react";

interface Arm {
  name: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
}

const arms: Arm[] = [
  {
    name: "AWFixer Academy",
    description:
      "Education and training — equipping minds with the tools to think clearly, act decisively, and build.",
    icon: <GraduationCap className="w-5 h-5" />,
  },
  {
    name: "AWFixer Army",
    description: "The disciplined body that puts principle into action. Enlist. Train. Serve.",
    icon: <Shield className="w-5 h-5" />,
    href: "https://awfixer.army",
  },
  {
    name: "AWFixer LLC",
    description:
      "A separate entity providing management, operations, and administrative support across all related organizations.",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    name: "AWFixer News",
    description:
      "Independent journalism covering stories that matter — without the filter of corporate or state interests.",
    icon: <Newspaper className="w-5 h-5" />,
  },
  {
    name: "AWFixer Health",
    description:
      "Health and wellness initiatives advancing physical, mental, and spiritual vitality.",
    icon: <Heart className="w-5 h-5" />,
  },
];

export default function CareersPage() {
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
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 24,
              mass: 0.8,
            }}
          >
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-foreground/40 uppercase tracking-widest">
              <span className="w-6 h-px bg-foreground/20" />
              Careers
            </div>

            <h1 className="text-4xl lg:text-5xl font-display leading-tight mb-6">Work with us</h1>

            <p className="text-lg text-foreground/60 leading-relaxed max-w-lg mx-auto">
              The question needs builders. Whether you&rsquo;re called to serve the church directly
              or through one of its allied arms, there&rsquo;s a place for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Church positions                                            */}
      {/* ============================================================ */}
      <section className="px-6 py-28 lg:py-36 border-t border-glass-border section-auto">
        <div className="max-w-[800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-foreground/40 uppercase tracking-widest">
              <span className="w-6 h-px bg-foreground/20" />
              The Church
            </div>

            <h2 className="text-3xl lg:text-4xl font-display leading-tight mb-6">
              Join the mission directly
            </h2>

            <p className="text-foreground/60 leading-relaxed mb-8">
              Open positions at AWFixer&rsquo;s Church will be listed here as they become available.
              We are always looking for people who are gripped by the question and ready to put
              their talents to work building something that lasts.
            </p>

            <div className="rounded-2xl border border-glass-border bg-glass backdrop-blur-sm p-8 text-center">
              <p className="text-foreground/40 font-mono text-sm">
                No open positions at this time. Check back soon.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Arms of the movement                                        */}
      {/* ============================================================ */}
      <section className="px-6 py-28 lg:py-36 border-t border-glass-border bg-bleach/30 section-auto">
        <div className="max-w-[1000px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-foreground/40 uppercase tracking-widest">
              <span className="w-6 h-px bg-foreground/20" />
              Arms of the Movement
            </div>

            <h2 className="text-3xl lg:text-4xl font-display leading-tight mb-4">
              Serve through an allied organization
            </h2>

            <p className="text-foreground/60 leading-relaxed max-w-xl mx-auto">
              If the church is not the right fit, one of its associated arms may be. Each advances
              the same question through a different discipline.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {arms.map((arm, i) => (
              <motion.div
                key={arm.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  delay: 0.1 + i * 0.08,
                  type: "spring",
                  stiffness: 200,
                  damping: 24,
                }}
                className={cn(
                  "group relative flex flex-col gap-3 rounded-2xl border border-glass-border bg-glass backdrop-blur-sm p-7",
                  "hover:border-foreground/20 transition-all duration-300 container-glow",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-foreground/5 text-foreground/60 group-hover:text-foreground/80 transition-colors">
                    {arm.icon}
                  </span>
                  <span className="text-sm font-mono tracking-tight text-foreground/80 group-hover:text-foreground transition-colors">
                    {arm.name}
                  </span>
                </div>
                <p className="text-sm text-foreground/50 leading-relaxed">{arm.description}</p>
                {arm.href && (
                  <span className="text-xs text-foreground/30 font-mono">Opens in new tab</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Personal staff                                              */}
      {/* ============================================================ */}
      <section className="px-6 py-28 lg:py-36 border-t border-glass-border section-auto">
        <div className="max-w-[800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-foreground/40 uppercase tracking-widest">
              <span className="w-6 h-px bg-foreground/20" />
              Personal Staff
            </div>

            <h2 className="text-3xl lg:text-4xl font-display leading-tight mb-6">
              Work directly with AWFixer
            </h2>

            <p className="text-foreground/60 leading-relaxed">
              Occasionally, positions on the personal staff of AWFixer open up. These roles are rare
              and are reserved for individuals who have prior experience working at one of the
              organizations above. When such opportunities arise, they will be listed here.
            </p>

            <div className="mt-8 flex items-center gap-4 text-sm text-foreground/40">
              <UserCircle className="w-5 h-5 shrink-0" />
              <span>No personal staff positions open at this time.</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Bottom CTA — back to the question                           */}
      {/* ============================================================ */}
      <section className="px-6 pb-28 lg:pb-36 border-t border-glass-border bg-bleach/30 section-auto">
        <div className="max-w-[800px] mx-auto text-center pt-20 lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          >
            <h2 className="text-2xl lg:text-3xl font-display leading-tight mb-6">
              The question is the work
            </h2>
            <p className="text-foreground/60 leading-relaxed mb-8 max-w-md mx-auto">
              Whether you join the church, one of its arms, or carry the question into your own
              field — the work begins wherever you are.
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

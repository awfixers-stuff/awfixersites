"use client";

import { motion } from "motion/react";
import { CLink as Link } from "@awfixersites/telemetry/link";
import { cn } from "@/lib/utils";

const sections = [
  {
    title: "1. Church status",
    body: "AWFixer's Church is a religious nonprofit corporation recognized by the Internal Revenue Service as a 501(c)(3) tax-exempt organization. All contributions to the church are tax-deductible to the fullest extent permitted by law.\n\nThe church is the parent entity through which all related organizations and ministries operate. Every subsidiary and allied organization described below exists solely to advance the church's mission — the ongoing inquiry into the question on which the world was founded — and none operates as a separate for-profit enterprise.",
  },
  {
    title: "2. Subsidiary and allied organizations",
    body: "The following organizations operate under the nonprofit umbrella of AWFixer's Church:\n\n• AWFixer Academy — educational programs and training\n• AWFixer Army — disciplined community service and action\n• AWFixer LLC — management and administrative support for all related entities\n• AWFixer News — independent journalism and publishing\n• AWFixer Health — health and wellness initiatives\n\nEach of these entities is structured as a nonprofit arm of the church. None is organized or operated for private profit. They exist to extend the church's mission into their respective fields of work.",
  },
  {
    title: "3. No private profit",
    body: "No part of the net earnings of AWFixer's Church or any of its subsidiaries inures to the benefit of any private shareholder or individual. No officer, director, or staff member holds an ownership interest in any of these organizations.\n\nCompensation for services rendered is limited to reasonable salaries, wages, or contracted fees. No person is entitled to a share of the organization's residual earnings. Upon dissolution or winding down, all remaining assets are distributed exclusively for tax-exempt purposes as determined by the IRS.",
  },
  {
    title: "4. Use of funds",
    body: "All revenue received by the church and its subsidiaries — whether from donations, grants, program services, or other sources — is used exclusively to sustain and advance the church's mission. Funds support:\n\n• Operations and infrastructure (facilities, technology, administrative costs)\n• Educational and community programs\n• Journalism and publishing efforts\n• Health and wellness services\n• Outreach and the ongoing work of carrying the question into the world\n\nNo funds are diverted to private enrichment, political campaign activity, or any purpose inconsistent with 501(c)(3) tax-exempt status.",
  },
  {
    title: "5. Religious and charitable purpose",
    body: 'AWFixer\'s Church is organized exclusively for religious, charitable, educational, and scientific purposes within the meaning of Section 501(c)(3) of the Internal Revenue Code. Our organizing question — "On what principle was the world founded?" — is both a scientific and spiritual inquiry. The work of the church and its subsidiaries is the pursuit of that question and the building of institutions, communities, and practices that flow from its answer.',
  },
  {
    title: "6. Contact",
    body: "For questions about our nonprofit status, tax-exempt determination, financial practices, or to request a copy of our determination letter:\n\ncontact@awfixer.church",
  },
];

export default function LegalPage() {
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
              Legal
            </div>

            <h1 className="text-4xl lg:text-5xl font-display leading-tight mb-6">
              Nonprofit Status
            </h1>

            <p className="text-lg text-foreground/60 leading-relaxed max-w-lg mx-auto">
              How the church&rsquo;s 501(c)(3) designation applies across every allied organization.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Content                                                     */}
      {/* ============================================================ */}
      <section className="px-6 pb-28 lg:pb-36 section-auto">
        <div className="max-w-[800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-10"
          >
            <div className="text-sm text-foreground/40 font-mono">Last updated: June 27, 2026</div>

            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.4 }}
                className="bg-glass backdrop-blur-sm border border-glass-border rounded-2xl p-8"
              >
                <h2 className="text-lg lg:text-xl font-display mb-4">{section.title}</h2>
                <div className="text-sm text-foreground/60 leading-relaxed whitespace-pre-line">
                  {section.body}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Back navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="mt-12 text-center"
          >
            <Link
              href="/"
              className={cn(
                "inline-flex items-center justify-center rounded-full h-11 px-7 text-xs font-bold uppercase tracking-wider",
                "bg-foreground text-background hover:brightness-110",
                "shadow-[0_6px_0_0_oklch(0.2_0_0)] active:shadow-none active:translate-y-[4px]",
                "transition-all duration-100 ease-out btn-glow",
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

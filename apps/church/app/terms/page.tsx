"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function TermsPage() {
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
              Terms of Service
            </h1>

            <p className="text-lg text-foreground/60 leading-relaxed max-w-lg mx-auto">
              The rules of the road for this site and your relationship with us.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Terms content                                               */}
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

            {[
              {
                title: "1. Acceptance of terms",
                body: "By accessing or using this website, you agree to be bound by these terms. If you do not agree, do not use the site. We reserve the right to update these terms at any time; continued use after changes constitutes acceptance.",
              },
              {
                title: "2. Nature of the organization",
                body: "AWFixer's Church is a 501(c)(3) nonprofit organization. Our mission is to foster inquiry into first principles — starting with the question \"on what principle was the world founded?\" — without judgment toward any person's background, beliefs, or circumstances.\n\nNothing on this site constitutes professional advice, whether legal, medical, psychological, or financial.",
              },
              {
                title: "3. User conduct",
                body: "You agree to use this site lawfully and respectfully. You may not:\n\n• Harass, threaten, or intimidate other users or our staff\n• Submit false or misleading information through contact forms\n• Attempt to circumvent security measures or disrupt site operations\n• Use automated tools (scrapers, bots) without prior written permission\n\nWe reserve the right to block access to anyone who violates these standards.",
              },
              {
                title: "4. Intellectual property",
                body: 'All content on this site — text, design, pixel art, code — is owned by AWFixer\'s Church unless otherwise attributed. You may view, share, and reference our content for personal, non-commercial purposes with appropriate attribution.\n\nYou may not reproduce, distribute, or modify substantial portions of the site without written permission. The quote "Present or absent, we wrestle with God" is attributed to Dr. Jordan B. Peterson and is used in the context of commentary and discussion.',
              },
              {
                title: "5. External links",
                body: "This site links to external resources, including awfixer.army, X (@AWFixerChurch), and other affiliated projects. These links are provided for your convenience. We are not responsible for the content, practices, or policies of third-party sites.",
              },
              {
                title: "6. Donations and contributions",
                body: "As a 501(c)(3) nonprofit, we may accept donations. All contributions are tax-deductible to the extent permitted by law. Donations are voluntary and non-refundable.\n\nWe do not solicit donations through third-party platforms or unsolicited communications. If you receive a suspicious request purporting to be from AWFixer's Church, contact us at contact@awfixer.church.",
              },
              {
                title: "7. Disclaimer and limitation of liability",
                body: 'This site is provided "as is" without warranties of any kind, express or implied. AWFixer\'s Church shall not be liable for any damages arising from your use of or inability to use this site.\n\nSome jurisdictions do not allow certain liability limitations; those limitations may not apply to you.',
              },
              {
                title: "8. Governing law",
                body: "These terms are governed by the laws of the United States and the state in which the organization is registered. Any disputes shall be resolved in the appropriate courts of that jurisdiction.",
              },
              {
                title: "9. Contact",
                body: "For questions about these terms:\n\ncontact@awfixer.church",
              },
            ].map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.04, duration: 0.4 }}
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

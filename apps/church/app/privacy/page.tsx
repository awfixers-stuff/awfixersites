"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PrivacyPage() {
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

            <h1 className="text-4xl lg:text-5xl font-display leading-tight mb-6">Privacy Policy</h1>

            <p className="text-lg text-foreground/60 leading-relaxed max-w-lg mx-auto">
              How we handle your data, your information, and your trust.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* Policy content                                              */}
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
                title: "1. What we collect and why",
                body: "We collect minimal information necessary to operate this website and respond to your communications. This includes:\n\n• Contact form submissions (name, email, message content)\n• Standard web server logs (IP address, browser type, referring pages, timestamps)\n• Anonymous aggregated analytics via Vercel (page views, traffic sources, performance metrics — no personal identifiers)\n\nWe do not sell, rent, or share your personal information with third parties for their marketing purposes. We do not use advertising trackers or behavioral profiling.",
              },
              {
                title: "2. How we use your data",
                body: "Your data is used only for:\n\n• Responding to inquiries you initiate\n• Improving the website and its content\n• Maintaining security and preventing abuse\n\nIf you contact us via email, we retain your message and our response for record-keeping purposes. You may request deletion at any time.",
              },
              {
                title: "3. Cookies and tracking",
                body: "We use essential cookies for technical operation (session management, CSRF protection). These do not track you across sites.\n\nWe do not use third-party analytics cookies. Our analytics (Vercel Speed Insights and Analytics) are privacy-preserving and do not rely on cross-site tracking.\n\nYou can configure your browser to reject cookies, though some site functionality may be affected.",
              },
              {
                title: "4. Data retention and deletion",
                body: "We retain personal data only as long as necessary to fulfill the purpose for which it was collected. Server logs are retained for 30 days. Email correspondence is retained until you request deletion.\n\nTo request deletion of your data, contact us at contact@awfixer.church. We will respond within 30 days.",
              },
              {
                title: "5. Third-party services",
                body: "This site is hosted on Vercel. Their privacy policy governs the infrastructure layer. We use no other third-party services that process personal data.\n\nLinks to external sites (X, awfixer.army, etc.) are provided for your convenience and are governed by their respective privacy policies.",
              },
              {
                title: "6. Changes to this policy",
                body: "We may update this privacy policy from time to time. Material changes will be noted on this page with an updated date. Continued use of the site after changes constitutes acceptance of the updated policy.",
              },
              {
                title: "7. Contact",
                body: "For questions about this policy or to exercise your data rights:\n\ncontact@awfixer.church",
              },
            ].map((section, i) => (
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

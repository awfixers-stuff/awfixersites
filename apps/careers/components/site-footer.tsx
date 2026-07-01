"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

const socialLinks = [{ name: "@AWFixerChurch", href: "https://x.com/AWFixerChurch" }];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-glass-border">
      {/* Glassy top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Main footer content */}
        <div className="py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 lg:gap-12">
            {/* Question & Mission — spans 3 cols */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ type: "spring", stiffness: 180, damping: 24, mass: 0.8 }}
              >
                <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-foreground/40 uppercase tracking-widest">
                  <span className="w-4 h-px bg-foreground/20" />
                  Our founding question
                </div>

                <h2 className="text-3xl lg:text-5xl font-display leading-tight mb-6 max-w-2xl">
                  On what principle was the world founded?
                </h2>

                <p className="text-base lg:text-lg text-foreground/65 leading-relaxed max-w-xl">
                  We start wherever you&rsquo;re standing — not where we think you should be. No
                  judgment for what you are or what you&rsquo;ve been through. The question matters
                  more than the answer you arrive at.
                </p>
              </motion.div>
            </div>

            {/* Links & info — spans 2 cols */}
            <div className="lg:col-span-2 flex flex-col justify-between gap-12">
              {/* Navigation links */}
              <div>
                <h3 className="font-medium mb-5 text-foreground/50 uppercase tracking-widest text-xs">
                  Navigate
                </h3>
                <ul className="space-y-3">
                  {[
                    { name: "Our Question", href: "https://awfixer.church/#our-question" },
                    { name: "Principles", href: "https://awfixer.church/#principles" },
                    { name: "Philosophy", href: "https://awfixer.church/philosophy" },
                    { name: "Community", href: "https://awfixer.church/#community" },
                    { name: "Contact", href: "https://awfixer.church/contact" },
                  ].map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-foreground/70 hover:text-foreground transition-colors inline-flex items-center gap-2 group"
                      >
                        {link.name}
                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social & 501(c)(3) */}
              <div>
                <h3 className="font-medium mb-5 text-foreground/50 uppercase tracking-widest text-xs">
                  Connect
                </h3>
                <div className="flex flex-wrap gap-6">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground/70 hover:text-foreground transition-colors flex items-center gap-1 group"
                    >
                      {link.name}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </a>
                  ))}
                </div>

                <p className="mt-5 text-xs text-foreground/40 leading-relaxed">
                  AWFixer&rsquo;s Church is a 501(c)(3) nonprofit organization.
                  <br />
                  All donations are tax-deductible to the extent permitted by law.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-glass-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground/40">
            &copy; {new Date().getFullYear()} AWFixer&rsquo;s Church. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-xs text-foreground/40">
            <Link
              href="https://awfixer.church/privacy"
              className="hover:text-foreground/70 transition-colors"
            >
              Privacy
            </Link>
            <span className="w-px h-3 bg-foreground/10" />
            <Link
              href="https://awfixer.church/terms"
              className="hover:text-foreground/70 transition-colors"
            >
              Terms
            </Link>
            <span className="w-px h-3 bg-foreground/10" />
            <Link
              href="https://donate.awfixer.church"
              className="hover:text-foreground/70 transition-colors"
            >
              Donations
            </Link>
            <span className="w-px h-3 bg-foreground/10" />
            <Link
              href="https://legal.awfixer.llc"
              className="hover:text-foreground/70 transition-colors"
            >
              Legal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

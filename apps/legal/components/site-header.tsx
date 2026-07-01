"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { AWFIXER_X_URL } from "@/lib/portfolio";

const navLinks = [
  { name: "Mandate", href: "/#mandate" },
  { name: "Oversight", href: "/#oversight" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Contact", href: "/#contact" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMobile = useCallback(() => setMenuOpen(false), []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-300",
        scrolled || menuOpen
          ? "border-b border-glass-border bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-6 lg:px-12">
        <Link href="/" className="group flex min-w-0 flex-col gap-0.5" onClick={closeMobile}>
          <span className="font-display text-sm font-semibold tracking-[0.2em] text-off-white uppercase">
            AWFixer
          </span>
          <span className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground uppercase">
            LLC
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-mono tracking-widest text-muted-foreground uppercase transition-colors hover:text-off-white"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <a
          href={AWFIXER_X_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-full border border-glass-border bg-glass px-4 py-2 text-xs font-mono tracking-wider text-off-white uppercase backdrop-blur-sm transition-colors hover:border-steel-bright/40 md:inline-flex"
        >
          @awfixers
        </a>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-glass-border text-off-white md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-0 top-16 bottom-0 z-40 border-t border-glass-border bg-background/95 backdrop-blur-xl md:hidden"
            initial={reduced ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav className="flex flex-col gap-2 p-6" aria-label="Mobile">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={reduced ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduced ? 0 : 0.05 * i }}
                >
                  <Link
                    href={link.href}
                    onClick={closeMobile}
                    className="block py-3 font-display text-2xl text-off-white"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <a
                href={AWFIXER_X_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobile}
                className="mt-6 inline-flex justify-center rounded-full border border-steel-bright/30 bg-steel-muted/40 px-6 py-3 text-xs font-mono tracking-widest uppercase"
              >
                @awfixers on X
              </a>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const CHURCH = "https://awfixer.church";

const navLinks = [
  { name: "Our Question", href: `${CHURCH}/#our-question` },
  { name: "Principles", href: `${CHURCH}/#principles` },
  { name: "Philosophy", href: `${CHURCH}/philosophy` },
  { name: "Community", href: `${CHURCH}/#community` },
  { name: "Contact", href: `${CHURCH}/contact` },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
} as const;

const linkVariants = {
  hidden: { y: 40, opacity: 0, filter: "blur(12px)" },
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 200, damping: 22, mass: 0.8 },
  },
  exit: {
    y: -20,
    opacity: 0,
    filter: "blur(6px)",
    transition: { duration: 0.25, ease: "easeIn" },
  },
} as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setScrolled(window.scrollY > 20);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
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
        "fixed z-50 transition-[top,left,right] duration-500 ease-out",
        scrolled ? "top-3 left-4 right-4" : "top-0 left-0 right-0",
      )}
    >
      <nav
        className={cn(
          "relative z-50 mx-auto transition-[max-width,background-color,border-color,box-shadow] duration-500",
          scrolled || menuOpen
            ? "max-w-[1200px] bg-glass backdrop-blur-xl border border-glass-border rounded-2xl shadow-lg shadow-black/5"
            : "max-w-[1400px]",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between px-6 lg:px-8 transition-[height] duration-500",
            scrolled ? "h-14" : "h-20",
          )}
        >
          {/* Logo */}
          <Link href="https://awfixer.church" className="flex items-center gap-3 group">
            {/* Pixel-church mini icon */}
            <span className="grid grid-cols-3 grid-rows-3 gap-px w-5 h-5">
              <span className="col-start-2 row-start-1 bg-foreground rounded-sm" />
              <span className="col-span-3 row-start-2 bg-foreground/70 rounded-sm" />
              <span className="col-span-3 row-start-3 bg-foreground/40 rounded-sm" />
            </span>
            <span
              className={cn(
                "font-display tracking-tight font-medium transition-[font-size] duration-500",
                scrolled ? "text-lg" : "text-xl",
              )}
            >
              AWFixer&rsquo;s Church
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-300 relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground/40 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="https://awfixer.church/#join"
              className={cn(
                "inline-flex items-center justify-center rounded-full font-bold uppercase tracking-wider transition-all duration-100 ease-out",
                "bg-foreground text-background hover:brightness-110",
                "shadow-[0_6px_0_0_oklch(0.2_0_0)] active:shadow-none active:translate-y-[4px]",
                scrolled ? "h-9 px-5 text-[11px]" : "h-11 px-7 text-xs",
                "btn-glow",
              )}
            >
              Join the Question
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden p-2 relative z-50"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile overlay — AnimatePresence for spring enter/exit */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.9 }}
            className="lg:hidden fixed inset-0 z-40 flex flex-col"
          >
            {/* Blur backdrop */}
            <div className="absolute inset-0 bg-glass backdrop-blur-2xl border-b border-glass-border" />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full px-8 pt-28 pb-8">
              {/* Nav links — motion container with staggered children */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex-1 flex flex-col justify-center gap-6"
              >
                {navLinks.map((link) => (
                  <motion.div key={link.name} variants={linkVariants}>
                    <Link
                      href={link.href}
                      onClick={closeMobile}
                      className="text-4xl sm:text-5xl font-display text-foreground hover:text-foreground/60 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 200, damping: 24 }}
                className="pt-8 border-t border-foreground/10"
              >
                <Link
                  href="https://awfixer.church/#join"
                  onClick={closeMobile}
                  className={cn(
                    "flex items-center justify-center w-full rounded-full h-14 text-base font-bold uppercase tracking-wider",
                    "bg-foreground text-background hover:brightness-110",
                    "shadow-[0_6px_0_0_oklch(0.2_0_0)] active:shadow-none active:translate-y-[4px]",
                    "transition-all duration-100 ease-out btn-glow",
                  )}
                >
                  Join the Question
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

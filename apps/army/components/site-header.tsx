"use client";
import type { Variants } from "motion/react";
import { createPortal } from "react-dom";

import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NavLink } from "./nav-link";
import { useSplash } from "./splash-provider";
import { cn } from "@awfixersites/ui/lib/utils";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/ranks", label: "Ranks" },
  { href: "/operations", label: "Operations" },
  { href: "/enlist", label: "Enlist" },
];

const panelVariants: Variants = {
  closed: { y: "-100%" },
  open: { y: 0 },
};

const itemVariants: Variants = {
  closed: { opacity: 0, y: -16 },
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.15 + i * 0.08,
      duration: 0.35,
      ease: "easeOut" as const,
    },
  }),
};

export function SiteHeader() {
  const pathname = usePathname();
  const { triggerSplash } = useSplash();
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  function handleNavigate() {
    triggerSplash();
    setOpen(false);
  }

  const isEnlistPage = pathname === "/enlist";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b",
        isEnlistPage
          ? "border-border/25 bg-transparent"
          : "border-border/50 bg-black/80 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <NavLink
          href="/"
          className="font-display text-sm font-bold tracking-wide text-bleach uppercase hover:text-crimson sm:text-base"
        >
          AWFixer&apos;s Army
        </NavLink>

        <nav className="hidden gap-1 sm:flex">
          {nav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className={cn(
                "rounded px-3 py-1.5 font-mono text-xs font-medium transition-colors",
                pathname === item.href
                  ? "bg-crimson/90 text-bleach"
                  : "text-muted-foreground hover:text-bleach",
              )}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((s) => !s)}
          className="relative z-50 flex h-9 w-9 items-center justify-center rounded border border-navy bg-black text-bleach sm:hidden"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span
                key="close"
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
                transition={{ duration: 0.15 }}
              >
                <X className="h-5 w-5" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ opacity: 0, rotate: 45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -45 }}
                transition={{ duration: 0.15 }}
              >
                <Menu className="h-5 w-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  aria-hidden="true"
                  className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setOpen(false)}
                />
                <motion.div
                  id="mobile-nav"
                  role="dialog"
                  aria-modal="true"
                  className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-black sm:hidden"
                  variants={panelVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ type: "spring", stiffness: 260, damping: 28 }}
                >
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setOpen(false)}
                    className="absolute top-3 right-4 flex h-9 w-9 items-center justify-center rounded border border-navy bg-black text-bleach"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <nav className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
                    {nav.map((item, i) => (
                      <motion.div
                        key={item.href}
                        custom={i}
                        variants={itemVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                      >
                        <NavLink
                          href={item.href}
                          onClick={handleNavigate}
                          className={cn(
                            "font-display block text-4xl font-bold tracking-tight uppercase transition-colors sm:text-5xl",
                            pathname === item.href
                              ? "text-crimson"
                              : "text-bleach hover:text-crimson",
                          )}
                        >
                          {item.label}
                        </NavLink>
                      </motion.div>
                    ))}
                  </nav>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </header>
  );
}

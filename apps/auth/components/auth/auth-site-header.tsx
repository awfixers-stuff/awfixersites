"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

import { AuthMark } from "@/components/auth/auth-mark";
import { useReferrerSite } from "@/lib/use-referrer-site";
import { cn } from "@/lib/utils";

function AuthSiteHeaderContent() {
  const [scrolled, setScrolled] = useState(false);
  const referrer = useReferrerSite();

  useEffect(() => {
    setScrolled(window.scrollY > 20);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          scrolled
            ? "max-w-[1200px] bg-glass backdrop-blur-xl border border-glass-border rounded-2xl shadow-lg shadow-black/50"
            : "max-w-[1400px]",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between px-6 lg:px-8 transition-[height] duration-500",
            scrolled ? "h-14" : "h-20",
          )}
        >
          <Link href="/" className="flex items-center gap-3 group">
            <AuthMark className="h-5 w-5" />
            <span
              className={cn(
                "font-display tracking-tight font-medium transition-[font-size] duration-500",
                scrolled ? "text-lg" : "text-xl",
              )}
            >
              AWFixer Account
            </span>
          </Link>

          <Link
            href={referrer.href}
            className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-300"
          >
            {referrer.backLabel}
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function AuthSiteHeader() {
  return (
    <Suspense
      fallback={
        <header className="fixed top-0 left-0 right-0 z-50">
          <nav className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-6 lg:px-8">
            <span className="font-display text-xl font-medium tracking-tight">AWFixer Account</span>
          </nav>
        </header>
      }
    >
      <AuthSiteHeaderContent />
    </Suspense>
  );
}

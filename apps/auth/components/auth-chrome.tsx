"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@awfixersites/ui/lib/utils";

const codesSiteUrl = process.env.NEXT_PUBLIC_CODES_SITE_URL ?? "https://awfixer.codes";

export function AuthChrome() {
  const [scrolled, setScrolled] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    setScrolled(window.scrollY > 20);

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed z-50 transition-[top,left,right,padding] duration-500 ease-out",
        scrolled ? "top-3 left-4 right-4" : "top-0 left-0 right-0",
      )}
    >
      <nav
        className={cn(
          "mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 transition-all duration-500 lg:px-12",
          scrolled
            ? "rounded-2xl border border-foreground/10 bg-background/80 shadow-lg backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <Link
          href={codesSiteUrl}
          className="font-display text-xl tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          AWFixer Codes
        </Link>
        <Link
          href={codesSiteUrl}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to site
        </Link>
      </nav>
    </header>
  );
}
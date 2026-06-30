"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const words = ["create", "build", "scale", "ship"];
const WORD_CYCLE_MS = 3000;
const EXIT_CLEANUP_MS = 600;
const CHAR_ENTER_STAGGER = 50;
const CHAR_EXIT_STAGGER = 40;

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [prevWordIndex, setPrevWordIndex] = useState<number | null>(null);
  const wordRef = useRef(0);

  // Entrance animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Word cycling — uses ref to avoid stale closure
  useEffect(() => {
    const interval = setInterval(() => {
      setPrevWordIndex(wordRef.current);
      const next = (wordRef.current + 1) % words.length;
      wordRef.current = next;
      setWordIndex(next);
    }, WORD_CYCLE_MS);
    return () => clearInterval(interval);
  }, []);

  // Remove outgoing word from DOM after its exit animation finishes
  useEffect(() => {
    if (prevWordIndex === null) return;
    const timer = setTimeout(() => setPrevWordIndex(null), EXIT_CLEANUP_MS);
    return () => clearTimeout(timer);
  }, [prevWordIndex]);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Subtle grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[1400px] mx-auto px-6 lg:px-12 pt-32 lg:pt-40 pb-12 lg:pb-16">
        {/* Eyebrow */}
        <div
          className={`mb-10 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
            <span className="w-8 h-px bg-foreground/30" />
            The platform for modern teams
          </span>
        </div>

        {/* Main headline */}
        <div className="mb-16">
          <h1
            className={`text-[clamp(3rem,12vw,10rem)] font-display leading-[0.9] tracking-tight transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="block">The platform</span>
            <span className="block">
              to{" "}
              <span className="relative inline-block">
                {/* Exiting word — absolute so it doesn't affect layout */}
                {prevWordIndex !== null && (
                  <span className="absolute left-0 top-0" aria-hidden>
                    <span className="inline-flex">
                      {words[prevWordIndex]!.split("").map((char, i) => (
                        <span
                          key={i}
                          className="inline-block animate-char-out"
                          style={{ animationDelay: `${i * CHAR_EXIT_STAGGER}ms` }}
                        >
                          {char}
                        </span>
                      ))}
                    </span>
                  </span>
                )}
                {/* Entering word — determines container width */}
                <span key={wordIndex} className="inline-flex">
                  {words[wordIndex]!.split("").map((char, i) => (
                    <span
                      key={i}
                      className="inline-block animate-char-in"
                      style={{ animationDelay: `${i * CHAR_ENTER_STAGGER}ms` }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-3 bg-foreground/10" />
              </span>
            </span>
          </h1>
        </div>

        {/* Description */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-end">
          <p
            className={`text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Your toolkit to stop configuring and start innovating. Securely build, deploy, and scale
            the best experiences.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row items-start gap-6 transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Link
              href="/#pricing"
              className="bg-foreground hover:bg-foreground/90 text-background px-8 h-14 text-base rounded-full group inline-flex items-center justify-center font-medium transition-colors"
            >
              Start free trial
              <svg
                className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="#features"
              className="h-14 px-8 text-base rounded-full border border-foreground/20 hover:bg-foreground/5 inline-flex items-center justify-center font-medium transition-colors"
            >
              Watch demo
            </Link>
          </div>
        </div>
      </div>

      {/* Stats marquee */}
      <div
        className={`relative left-0 right-0 px-6 lg:px-12 pb-8 lg:pb-12 transition-all duration-700 delay-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex gap-16 marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-16">
              {[
                { value: "20 days", label: "saved on builds", company: "NETFLIX" },
                { value: "98%", label: "faster deployment", company: "STRIPE" },
                { value: "300%", label: "throughput increase", company: "LINEAR" },
                { value: "6x", label: "faster to ship", company: "NOTION" },
              ].map((stat) => (
                <div key={`${stat.company}-${i}`} className="flex items-baseline gap-4">
                  <span className="text-4xl lg:text-5xl font-display">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                    <span className="block font-mono text-xs mt-1">{stat.company}</span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

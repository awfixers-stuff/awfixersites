"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { SplashScreen } from "./splash-screen";
type SplashContextValue = {
  triggerSplash: () => void;
  /** True when the splash overlay is currently visible. */
  showing: boolean;
  /** True once the splash has fully exited and been removed from the DOM. */
  completed: boolean;
};

const SplashContext = createContext<SplashContextValue | null>(null);

const INITIAL_DURATION_MS = 2300;
const NAVIGATION_DURATION_MS = 1900;

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showInitial, setShowInitial] = useState(true);
  const [showNavigation, setShowNavigation] = useState(false);
  const pathnameRef = useRef(pathname);
  const isInitialRef = useRef(true);

  // Initial page-load splash.
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInitial(false);
      isInitialRef.current = false;
    }, INITIAL_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  // Show the splash while the pathname is changing (covers browser back/forward
  // and any navigation that does not go through NavLink).
  useEffect(() => {
    if (pathname !== pathnameRef.current) {
      pathnameRef.current = pathname;

      if (isInitialRef.current) {
        return;
      }

      setShowNavigation(true);
      const timer = setTimeout(() => {
        setShowNavigation(false);
      }, NAVIGATION_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Listen for browser back/forward so the splash appears immediately, before
  // the pathname hook fires.
  useEffect(() => {
    function onPopState() {
      if (!isInitialRef.current) {
        setShowNavigation(true);
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const triggerSplash = useCallback(() => {
    if (!isInitialRef.current) {
      setShowNavigation(true);
    }
  }, []);
  const showing = showInitial || showNavigation;
  const [completed, setCompleted] = useState(!showing);

  useEffect(() => {
    setCompleted(!showing);
  }, [showing]);

  return (
    <SplashContext.Provider value={{ triggerSplash, showing, completed }}>
      <AnimatePresence
        onExitComplete={() => {
          // Splash fully removed from the DOM.
          setCompleted(true);
        }}
      >
        {showing && <SplashScreen key="splash" />}
      </AnimatePresence>
      {children}
    </SplashContext.Provider>
  );
}

export function useSplash() {
  const context = useContext(SplashContext);
  if (!context) {
    throw new Error("useSplash must be used within a SplashProvider");
  }
  return context;
}

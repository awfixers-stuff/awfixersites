"use client";

import { createContext, useContext, type RefObject } from "react";

export type MotionBackgroundFill = "container" | "viewport" | "document";

export type MotionBackgroundContextValue = {
  containerRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
  isActive: boolean;
  fill: MotionBackgroundFill;
};

export const MotionBackgroundContext = createContext<MotionBackgroundContextValue | null>(null);

export function useMotionBackground() {
  const context = useContext(MotionBackgroundContext);
  if (!context) {
    throw new Error("MotionBackground components must be used within <MotionBackground>.");
  }
  return context;
}

export function useOptionalMotionBackground() {
  return useContext(MotionBackgroundContext);
}

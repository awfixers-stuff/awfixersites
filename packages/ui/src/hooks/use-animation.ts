"use client";

import { useEffect, useRef, useState } from "react";

/** Animation constants — single source of truth for timing values */
export const ANIMATION = {
  TIME_STEP_MEDIUM: 0.02,
  FONT_SIZE_SMALL: 12,
  FONT_SIZE_MEDIUM: 14,
  SPHERE_STEP: 0.15,
  SPHERE_ROTATION_Y: 0.3,
  SPHERE_ROTATION_X: 0.2,
  SPHERE_PHI_SPEED: 0.5,
  SPHERE_RADIUS_RATIO: 0.525,
  ALPHA_SPHERE_MIN: 0.2,
  ALPHA_RANGE: 0.4,
  TETRA_ROTATION_Y: 0.4,
  TETRA_ROTATION_X: 0.3,
  TETRA_ROTATION_Z: 0.2,
  TETRA_SCALE_RATIO: 0.7,
  TETRA_EDGE_STEP: 0.05,
  TETRA_FACE_STEP: 0.12,
  TETRA_DEPTH_RANGE: 1.5,
  TETRA_FONT_SIZE: 18,
  ALPHA_MIN: 0.15,
  ALPHA_TETRA_RANGE: 0.25,
  WAVE_WAVE1_X: 0.2,
  WAVE_WAVE1_TIME: 2,
  WAVE_WAVE1_Y: 0.15,
  WAVE_WAVE2_FACTOR: 0.1,
  WAVE_WAVE2_TIME: 1.5,
  WAVE_WAVE3_X: 0.1,
  WAVE_WAVE3_Y: 0.1,
  WAVE_WAVE3_TIME: 0.8,
  WAVE_CELL_SIZE: 20,
  WAVE_FONT_SIZE: 14,
  CHARS_BLOCK: "░▒▓█▀▄▌▐│─┤├┴┬╭╮╰╯",
  CHARS_DOT: "·∘○◯◌●◉",
  VISIBILITY_THRESHOLD: 0.05,
  RESIZE_DEBOUNCE_MS: 150,
} as const;

interface UseAnimationOptions {
  render: (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => void;
  threshold?: number;
}

interface UseAnimationReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isVisible: boolean;
  prefersReducedMotion: boolean;
}

/**
 * Shared animation hook providing:
 * - IntersectionObserver-based visibility detection (pauses when off-screen)
 * - prefers-reduced-motion awareness
 * - DPR-aware canvas sizing with debounced resize
 * - Clean requestAnimationFrame lifecycle
 */
export function useAnimation({ render, threshold }: UseAnimationOptions): UseAnimationReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);
  const timeRef = useRef(0);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReducedMotionRef = useRef(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const isVisibleRef = useRef(false);
  const renderRef = useRef(render);

  renderRef.current = render;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mediaQuery.matches;
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, ANIMATION.RESIZE_DEBOUNCE_MS);
    };

    handleResize();
    window.addEventListener("resize", debouncedResize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? false;
        isVisibleRef.current = visible;
        setIsVisible(visible);
      },
      { threshold: threshold ?? ANIMATION.VISIBILITY_THRESHOLD },
    );

    observer.observe(canvas);

    const animate = () => {
      if (!isVisibleRef.current) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      if (prefersReducedMotionRef.current) {
        const rect = canvas.getBoundingClientRect();
        renderRef.current(ctx, rect.width, rect.height, 0);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      renderRef.current(ctx, rect.width, rect.height, timeRef.current);
      timeRef.current += ANIMATION.TIME_STEP_MEDIUM;
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimer);
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, [threshold]);

  return { canvasRef, isVisible, prefersReducedMotion };
}

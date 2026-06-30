"use client";

import { useCallback, useEffect, useMemo, useRef, type CSSProperties } from "react";

import { cn } from "@awfixersites/ui/lib/utils";
import { useOptionalMotionBackground } from "./context";

const MAX_DOTS = 2_400;

type Rgb = { r: number; g: number; b: number };

type Dot = {
  cx: number;
  cy: number;
  phase: number;
};

export type DotGridProps = {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  baseOpacity?: number;
  ambient?: boolean;
  ambientSpeed?: number;
  ambientAmplitude?: number;
  colorWave?: number;
  className?: string;
  style?: CSSProperties;
};

type ParsedColor = { rgb: Rgb; alpha: number };

function hexToRgb(hex: string): Rgb {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return { r: 163, g: 163, b: 163 };

  return {
    r: Number.parseInt(match[1]!, 16),
    g: Number.parseInt(match[2]!, 16),
    b: Number.parseInt(match[3]!, 16),
  };
}

function parseColor(color: string, fallback: Rgb): ParsedColor {
  const trimmed = color.trim();

  if (trimmed.startsWith("#")) {
    return { rgb: hexToRgb(trimmed), alpha: 1 };
  }

  const rgbMatch = trimmed.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const parts = rgbMatch[1]!.split(",").map((part) => part.trim());
    const r = Number.parseFloat(parts[0] ?? "");
    const g = Number.parseFloat(parts[1] ?? "");
    const b = Number.parseFloat(parts[2] ?? "");
    const alpha = parts[3] !== undefined ? Number.parseFloat(parts[3]) : 1;

    if ([r, g, b].every((channel) => Number.isFinite(channel))) {
      return {
        rgb: {
          r: Math.round(Math.min(255, Math.max(0, r))),
          g: Math.round(Math.min(255, Math.max(0, g))),
          b: Math.round(Math.min(255, Math.max(0, b))),
        },
        alpha: Number.isFinite(alpha) ? Math.min(1, Math.max(0, alpha)) : 1,
      };
    }
  }

  return { rgb: fallback, alpha: 1 };
}

function toRgba(rgb: Rgb, alpha: number) {
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

function mixRgb(base: Rgb, active: Rgb, amount: number): Rgb {
  const t = Math.min(1, Math.max(0, amount));
  return {
    r: Math.round(base.r + (active.r - base.r) * t),
    g: Math.round(base.g + (active.g - base.g) * t),
    b: Math.round(base.b + (active.b - base.b) * t),
  };
}

export function DotGrid({
  dotSize = 3.5,
  gap = 24,
  baseColor = "rgba(245, 245, 245, 0.28)",
  activeColor = "#dc143c",
  baseOpacity = 1,
  ambient = true,
  ambientSpeed = 0.45,
  ambientAmplitude = 2.5,
  colorWave = 0.3,
  className,
  style,
}: DotGridProps) {
  const background = useOptionalMotionBackground();
  const reducedMotion = background?.reducedMotion ?? false;
  const isActive = background?.isActive ?? true;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const frameRef = useRef<number | null>(null);

  const baseColorParsed = useMemo(
    () => parseColor(baseColor, { r: 163, g: 163, b: 163 }),
    [baseColor],
  );
  const activeColorParsed = useMemo(
    () => parseColor(activeColor, { r: 220, g: 20, b: 60 }),
    [activeColor],
  );

  const circlePath = useMemo(() => {
    if (typeof window === "undefined" || !window.Path2D) return null;
    const path = new Path2D();
    path.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return path;
  }, [dotSize]);

  const buildGrid = useCallback(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const { width, height } = wrapper.getBoundingClientRect();
    if (width <= 0 || height <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    let cell = dotSize + gap;
    let cols = Math.max(1, Math.floor((width + gap) / cell));
    let rows = Math.max(1, Math.floor((height + gap) / cell));

    while (cols * rows > MAX_DOTS) {
      cell += 2;
      cols = Math.max(1, Math.floor((width + gap) / cell));
      rows = Math.max(1, Math.floor((height + gap) / cell));
    }

    const gridWidth = cell * cols - gap;
    const gridHeight = cell * rows - gap;
    const startX = (width - gridWidth) / 2 + dotSize / 2;
    const startY = (height - gridHeight) / 2 + dotSize / 2;

    const dots: Dot[] = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const cx = startX + col * cell;
        const cy = startY + row * cell;
        dots.push({
          cx,
          cy,
          phase: cx * 0.017 + cy * 0.013,
        });
      }
    }

    dotsRef.current = dots;
  }, [dotSize, gap]);

  useEffect(() => {
    buildGrid();

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const resizeObserver = new ResizeObserver(buildGrid);
    resizeObserver.observe(wrapper);

    const onViewportResize = () => buildGrid();
    window.addEventListener("resize", onViewportResize);
    window.visualViewport?.addEventListener("resize", onViewportResize);
    window.visualViewport?.addEventListener("scroll", onViewportResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", onViewportResize);
      window.visualViewport?.removeEventListener("resize", onViewportResize);
      window.visualViewport?.removeEventListener("scroll", onViewportResize);
    };
  }, [buildGrid]);

  useEffect(() => {
    if (!circlePath) return;

    const draw = (timestamp: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      const { width, height } = canvas.getBoundingClientRect();
      context.clearRect(0, 0, width, height);

      const canAnimate = ambient && !reducedMotion && isActive;
      const time = timestamp * 0.001;

      for (const dot of dotsRef.current) {
        let offsetX = 0;
        let offsetY = 0;

        if (canAnimate) {
          offsetX = Math.sin(time * ambientSpeed + dot.phase) * ambientAmplitude;
          offsetY =
            Math.cos(time * ambientSpeed * 0.82 + dot.phase * 1.17) * ambientAmplitude * 0.75;
        }

        const wave =
          (Math.sin(time * 0.55 + dot.cx * 0.007 + dot.cy * 0.005 + dot.phase) + 1) * 0.5;
        const rgb = mixRgb(baseColorParsed.rgb, activeColorParsed.rgb, wave * colorWave);
        const alpha = baseColorParsed.alpha * baseOpacity * (0.88 + wave * 0.12);

        context.save();
        context.translate(dot.cx + offsetX, dot.cy + offsetY);
        context.fillStyle = toRgba(rgb, alpha);
        context.fill(circlePath);
        context.restore();
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [
    activeColorParsed,
    ambient,
    ambientAmplitude,
    ambientSpeed,
    baseColorParsed,
    baseOpacity,
    circlePath,
    colorWave,
    isActive,
    reducedMotion,
  ]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
      style={style}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

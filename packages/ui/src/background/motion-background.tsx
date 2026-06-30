"use client";

import { useRef, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

import { useAnimationActive } from "../hooks/use-animation-active";
import { MotionBackgroundContext, type MotionBackgroundFill } from "./context";
import { DotGrid, type DotGridProps } from "./dot-grid";
import { cn } from "@awfixersites/ui/lib/utils";

type MotionBackgroundRootProps = ComponentPropsWithoutRef<"div"> & {
  fill?: MotionBackgroundFill;
};

type LayerProps = ComponentPropsWithoutRef<"div"> & {
  parallax?: number;
};

type ImageLayerProps = {
  src: string;
  alt?: string;
  fit?: "cover" | "contain";
  position?: string;
  parallax?: number | "scroll";
  className?: string;
  style?: CSSProperties;
  loading?: "eager" | "lazy";
};

type OverlayProps = ComponentPropsWithoutRef<"div"> & {
  variant?: "none" | "vignette" | "bottom" | "top" | "radial";
  fromClassName?: string;
  toClassName?: string;
};

type ContentProps = ComponentPropsWithoutRef<"div">;

const overlayVariants: Record<NonNullable<OverlayProps["variant"]>, string> = {
  none: "",
  vignette: "bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.72)_100%)]",
  bottom: "bg-gradient-to-t from-black/80 via-black/20 to-transparent",
  top: "bg-gradient-to-b from-black/70 via-black/15 to-transparent",
  radial: "bg-[radial-gradient(circle_at_top,rgba(220,20,60,0.22),transparent_55%)]",
};

function MotionBackgroundRoot({
  className,
  children,
  fill = "container",
  ...props
}: MotionBackgroundRootProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const intersectionActive = useAnimationActive(containerRef);
  const isActive = fill === "viewport" ? true : intersectionActive;

  return (
    <MotionBackgroundContext.Provider value={{ containerRef, reducedMotion, isActive, fill }}>
      <div
        ref={containerRef}
        className={cn(
          "pointer-events-none isolate w-full",
          fill === "viewport" && "fixed inset-0 z-0 min-h-[100dvh]",
          fill === "document" && "absolute inset-0 z-0 min-h-full",
          fill === "container" && "relative min-h-full overflow-hidden",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </MotionBackgroundContext.Provider>
  );
}

function Layer({ className, children, parallax = 0, style, ...props }: LayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 120, damping: 24, mass: 0.4 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 24, mass: 0.4 });
  const offsetX = useTransform(springX, (value) => value * parallax);
  const offsetY = useTransform(springY, (value) => value * parallax);
  const transform = useMotionTemplate`translate3d(${offsetX}px, ${offsetY}px, 0)`;

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || parallax <= 0 || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x * 24);
    mouseY.set(y * 24);
  };

  const onPointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0", className)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      {...props}
    >
      <motion.div className="h-full w-full" style={{ transform, ...style }}>
        {children}
      </motion.div>
    </div>
  );
}

function ImageLayer({
  src,
  alt = "",
  fit = "cover",
  position = "center",
  parallax = 0,
  className,
  style,
  loading = "lazy",
}: ImageLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const scrollY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 26 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 26 });
  const pointerX = useTransform(
    springX,
    (value) => value * (typeof parallax === "number" ? parallax : 0),
  );
  const pointerY = useTransform(
    springY,
    (value) => value * (typeof parallax === "number" ? parallax : 0),
  );

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || typeof parallax !== "number" || parallax <= 0 || !containerRef.current)
      return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(((event.clientX - rect.left) / rect.width - 0.5) * 20);
    mouseY.set(((event.clientY - rect.top) / rect.height - 0.5) * 20);
  };

  const onPointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden", className)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <motion.img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        draggable={false}
        className={cn(
          "h-[112%] w-[112%] max-w-none object-center",
          fit === "cover" ? "object-cover" : "object-contain",
        )}
        style={{
          objectPosition: position,
          x: typeof parallax === "number" && !reducedMotion ? pointerX : 0,
          y:
            parallax === "scroll" && !reducedMotion
              ? scrollY
              : typeof parallax === "number" && !reducedMotion
                ? pointerY
                : 0,
          ...style,
        }}
      />
    </div>
  );
}

function Overlay({
  className,
  variant = "vignette",
  fromClassName,
  toClassName,
  style,
  ...props
}: OverlayProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 z-[1]",
        overlayVariants[variant],
        fromClassName,
        toClassName,
        className,
      )}
      style={style}
      {...props}
    />
  );
}

function GridLayer(props: DotGridProps) {
  return <DotGrid {...props} />;
}

function Content({ className, children, ...props }: ContentProps) {
  return (
    <div className={cn("relative z-10", className)} {...props}>
      {children}
    </div>
  );
}

export type MotionBackgroundProps = MotionBackgroundRootProps & {
  children: ReactNode;
};

export const MotionBackground = Object.assign(MotionBackgroundRoot, {
  Layer,
  Image: ImageLayer,
  Overlay,
  DotGrid: GridLayer,
  Content,
});

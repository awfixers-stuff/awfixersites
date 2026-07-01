import { cn } from "./utils";

const ctaButtonBaseClassName = cn(
  "inline-flex items-center justify-center rounded-full font-bold uppercase tracking-wider transition-all duration-100 ease-out",
  "bg-foreground text-background hover:brightness-110",
  "shadow-[0_6px_0_0_oklch(0.2_0_0)] active:shadow-none active:translate-y-[4px] active:not-aria-[haspopup]:translate-y-[4px]",
  "btn-glow",
);

export function ctaButtonClassName(size: "compact" | "default" | "full" = "default") {
  return cn(
    ctaButtonBaseClassName,
    size === "compact" && "h-9 px-5 text-[11px]",
    size === "default" && "h-11 px-7 text-xs",
    size === "full" && "w-full h-14 px-10 text-base",
  );
}

export function ctaOutlineButtonClassName(fullWidth = false) {
  return cn(
    "inline-flex items-center justify-center rounded-full font-medium transition-colors btn-glow",
    "border border-foreground/20 text-foreground/80 hover:bg-foreground/5",
    fullWidth ? "w-full h-12 px-8 text-sm" : "h-11 px-7 text-sm",
  );
}

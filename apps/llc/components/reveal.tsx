"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const easeOut = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Hero-only entrance (no scroll observer) */
  immediate?: boolean;
};

export function Reveal({ children, className, delay = 0, immediate = false }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const motionProps = immediate
    ? {
        initial: { opacity: 0, y: 28 },
        animate: { opacity: 1, y: 0 },
        transition: { delay, duration: 0.65, ease: easeOut },
      }
    : {
        initial: { opacity: 0, y: 32 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { delay, type: "spring" as const, stiffness: 200, damping: 28 },
      };

  return (
    <motion.div className={className} {...motionProps}>
      {children}
    </motion.div>
  );
}
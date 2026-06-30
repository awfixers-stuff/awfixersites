"use client";

import { useMemo } from "react";
import { motion, type Variants } from "motion/react";

const COLS = 25;
const ROWS = 13;
const CANTON_COLS = 10;
const CANTON_ROWS = 7;

const CRIMSON = "#DC143C";
const BLEACH = "#F5F5F5";
const NAVY = "#000080";

type Pixel = {
  id: number;
  color: string;
  row: number;
  col: number;
};

function generateFlagPixels(): Pixel[] {
  const pixels: Pixel[] = [];
  const starCenters: { x: number; y: number }[] = [];

  for (let row = 0; row < CANTON_ROWS; row++) {
    const starsInRow = row % 2 === 0 ? 6 : 5;
    const spacing = CANTON_COLS / starsInRow;
    for (let star = 0; star < starsInRow; star++) {
      starCenters.push({
        x: (star + 0.5) * spacing,
        y: row + 0.5,
      });
    }
  }

  let id = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      let color: string;

      if (col < CANTON_COLS && row < CANTON_ROWS) {
        let isStar = false;
        for (const center of starCenters) {
          if (Math.round(center.x) === col && Math.round(center.y) === row) {
            isStar = true;
            break;
          }
        }
        color = isStar ? BLEACH : NAVY;
      } else {
        const stripe = Math.floor(row / (ROWS / 13));
        color = stripe % 2 === 0 ? CRIMSON : BLEACH;
      }

      pixels.push({ id: id++, color, row, col });
    }
  }

  return pixels;
}

const overlayVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.0025,
      delayChildren: 0.15,
    },
  },
};

const pixelVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 18,
    },
  },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 1.1, duration: 0.5, ease: "easeOut" },
  },
};

export function SplashScreen() {
  const pixels = useMemo(() => generateFlagPixels(), []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="flex flex-col items-center gap-6 p-4">
        <motion.div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
            width: "min(95vw, calc(80vh * 19 / 10))",
            aspectRatio: "19 / 10",
          }}
          variants={gridVariants}
          initial="hidden"
          animate="visible"
        >
          {pixels.map((pixel) => (
            <motion.div
              key={pixel.id}
              className="h-full w-full"
              style={{ backgroundColor: pixel.color }}
              variants={pixelVariants}
            />
          ))}
        </motion.div>

        <motion.h1
          className="font-display text-center text-xl font-bold tracking-wide text-bleach uppercase sm:text-2xl md:text-3xl"
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          AWFixer&apos;s Army
        </motion.h1>
      </div>
    </motion.div>
  );
}

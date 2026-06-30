"use client";

import { useMemo } from "react";
import { motion, type Variants } from "motion/react";

const COLS = 17;
const ROWS = 23;

const PURE = "#FFFFFF";
const BRIGHT = "#F8F8F8";
const CREAM = "#F0F0EC";
const GOLD = "#F5E6C8";

type Pixel = {
  id: number;
  color: string;
  row: number;
  col: number;
};

// Pixel-art temple/church facade on a 17x23 (portrait) grid.
//   P = pure white  (cross, centre feature)
//   B = bright white (main surfaces)
//   C = cream        (shadows, depth)
//   G = gold         (roof accent)
//   . = transparent  (sky — blends with the black overlay)
const TEMPLE: string[] = [
  // col:  01234567890123456
  "........P........", //  0: cross top
  "........P........", //  1: cross vertical
  "........P........", //  2: cross vertical
  ".......PPP.......", //  3: cross arm
  "......PPPPP......", //  4: spire point
  ".....PPPPPPP.....", //  5: spire
  "....PPPPPPPPP....", //  6: spire
  "...PPPPPPPPPPP...", //  7: spire
  "..PPPPPPPPPPPPP..", //  8: spire base
  "..GGGGGGGGGGGGG..", //  9: gold roof trim
  ".BBBBBBBBBBBBBBB.", // 10: body top
  ".BBCCCCCCCCCCCBB.", // 11: upper wall
  ".BCCPPPPPPPPPCCB.", // 12: clerestory windows
  ".BBCCCCCCCCCCCBB.", // 13: wall band
  ".BCCPPCCXCCPPCCB.", // 14: rose-window row
  ".BBCCCCCCCCCCCBB.", // 15: wall band
  ".BCCPPCCXCCPPCCB.", // 16: window row
  ".BBCCCCCCCCCCCBB.", // 17: wall band
  ".BBCCPPCXCPPCCBB.", // 18: door row (centre door)
  ".BBBBBBBBBBBBBBB.", // 19: body base
  "BBBBBBBBBBBBBBBBB", // 20: step 1
  "BBBBBBBBBBBBBBBBB", // 21: step 2
  "BBBBBBBBBBBBBBBBB", // 22: step 3
];

const CHAR_MAP: Record<string, string> = {
  P: PURE,
  B: BRIGHT,
  C: CREAM,
  G: GOLD,
};

function generateTemplePixels(): Pixel[] {
  const pixels: Pixel[] = [];
  let id = 0;

  for (let row = 0; row < ROWS; row++) {
    const rowDef = TEMPLE[row] ?? "";
    for (let col = 0; col < COLS; col++) {
      const ch = rowDef[col] ?? ".";
      const color = CHAR_MAP[ch] ?? "transparent";
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
  const pixels = useMemo(() => generateTemplePixels(), []);

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
            height: "min(80vh, 520px)",
            aspectRatio: `${COLS} / ${ROWS}`,
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
          AWFixer&apos;s Church
        </motion.h1>
      </div>
    </motion.div>
  );
}

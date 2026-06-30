"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";

/* ------------------------------------------------------------------ */
/* Pixel-art church — same layout as the hero icon on page.tsx        */
/* Color roles:                                                      */
/*   X = foreground (cross/spire — theme-aware via currentColor)     */
/*   G = gold roof accent                                            */
/*   B = bright white body surfaces                                  */
/*   C = cream shadows/depth                                         */
/*   . = transparent (sky)                                           */
/* ------------------------------------------------------------------ */

const GRID = [
  //           01234567890123456
  /*  0 */ "........X........",
  /*  1 */ "........X........",
  /*  2 */ "........X........",
  /*  3 */ ".......XXX.......",
  /*  4 */ "......XXXXX......",
  /*  5 */ ".....XXXXXXX.....",
  /*  6 */ "....XXXXXXXXX....",
  /*  7 */ "...XXXXXXXXXXX...",
  /*  8 */ "..XXXXXXXXXXXXX..",
  /*  9 */ "..GGGGGGGGGGGGG..",
  /* 10 */ ".BBBBBBBBBBBBBBB.",
  /* 11 */ ".BBCCCCCCCCCCCBB.",
  /* 12 */ ".BCCCCCCCCCCCCCB.",
  /* 13 */ ".BBCCCCCCCCCCCBB.",
  /* 14 */ ".BCCCCCCCCCCCCCB.",
  /* 15 */ ".BBCCCCCCCCCCCBB.",
  /* 16 */ ".BCCCCCCCCCCCCCB.",
  /* 17 */ ".BBCCCCCCCCCCCBB.",
  /* 18 */ ".BBCCCCCXCCCCCBB.",
  /* 19 */ ".BBBBBBBBBBBBBBB.",
  /* 20 */ "BBBBBBBBBBBBBBBBB",
  /* 21 */ "BBBBBBBBBBBBBBBBB",
  /* 22 */ "BBBBBBBBBBBBBBBBB",
];

const FILL_MAP: Record<string, string> = {
  X: "currentColor",
  G: "#F5E6C8",
  B: "#F8F8F8",
  C: "#F0F0EC",
};

const COLS = 17;

interface Pixel {
  x: number;
  y: number;
  fill: string;
}

/** Deterministic pseudo-random in [min, max) using a seed per index. */
function seededRandom(seed: number, min: number, max: number): number {
  const s = Math.sin(seed * 9301 + 49297) * 49297;
  const r = s - Math.floor(s);
  return min + r * (max - min);
}

function buildPixels(): Pixel[] {
  const pixels: Pixel[] = [];
  for (let row = 0; row < GRID.length; row++) {
    const rdef = GRID[row] ?? "";
    for (let col = 0; col < COLS; col++) {
      const ch = rdef[col] ?? ".";
      const fill = FILL_MAP[ch];
      if (fill) pixels.push({ x: col, y: row, fill });
    }
  }
  return pixels;
}

/* We want the scatter to feel organic — each pixel flies in a slightly
   different direction with its own rotation.  A deterministic seed per
   pixel keeps the "explosion" shape stable across mounts. */
function buildVectors(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    dx: seededRandom(i * 3 + 1, -3, 3), // SVG user units — viewBox is 0..17
    dy: seededRandom(i * 3 + 2, -5, 1.5), // bias upward, ~1× icon height
    rotate: seededRandom(i * 3 + 3, -300, 300),
  }));
}
const SPRING_OUT: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 14,
  mass: 0.6,
};

const SPRING_IN: Transition = {
  type: "spring",
  stiffness: 140,
  damping: 22,
  mass: 0.8,
};

/* ------------------------------------------------------------------ */
export function ChurchIcon({ className }: { className?: string }) {
  const prefersReduced = useReducedMotion();
  const [scattered, setScattered] = useState(false);

  const pixels = useMemo(buildPixels, []);
  const vectors = useMemo(() => buildVectors(pixels.length), [pixels.length]);

  const scatter = useCallback(() => {
    if (prefersReduced) return;
    setScattered(true);
  }, [prefersReduced]);

  const restore = useCallback(() => {
    if (prefersReduced) return;
    setScattered(false);
  }, [prefersReduced]);

  return (
    <div className={className} onPointerEnter={scatter} onPointerLeave={restore}>
      <svg
        viewBox="0 0 17 23"
        className="w-full h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {pixels.map((p, i) => {
          const v = vectors[i];
          if (!v) return null;
          return (
            <motion.g
              key={i}
              animate={
                scattered
                  ? {
                      translateX: v.dx,
                      translateY: v.dy,
                      rotate: v.rotate,
                      opacity: 0.35,
                    }
                  : {
                      translateX: 0,
                      translateY: 0,
                      rotate: 0,
                      opacity: 1,
                    }
              }
              transition={scattered ? SPRING_OUT : SPRING_IN}
              style={{ transformOrigin: `${p.x + 0.5}px ${p.y + 0.5}px` }}
            >
              <rect x={p.x} y={p.y} width={1} height={1} fill={p.fill} />
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

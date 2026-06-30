"use client";

import { useAnimation, ANIMATION } from "@awfixersites/ui/hooks/use-animation";

const CHARS = ANIMATION.CHARS_BLOCK;

const VERTICES = [
  { x: 0, y: 1, z: 0 },
  { x: -0.943, y: -0.333, z: -0.5 },
  { x: 0.943, y: -0.333, z: -0.5 },
  { x: 0, y: -0.333, z: 1 },
];

const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 2],
  [2, 3],
  [3, 1],
];

const FACES: [number, number, number][] = [
  [0, 1, 2],
  [0, 2, 3],
  [0, 3, 1],
  [1, 3, 2],
];

function rotateY(point: { x: number; y: number; z: number }, angle: number) {
  return {
    x: point.x * Math.cos(angle) - point.z * Math.sin(angle),
    y: point.y,
    z: point.x * Math.sin(angle) + point.z * Math.cos(angle),
  };
}

function rotateX(point: { x: number; y: number; z: number }, angle: number) {
  return {
    x: point.x,
    y: point.y * Math.cos(angle) - point.z * Math.sin(angle),
    z: point.y * Math.sin(angle) + point.z * Math.cos(angle),
  };
}

function rotateZ(point: { x: number; y: number; z: number }, angle: number) {
  return {
    x: point.x * Math.cos(angle) - point.y * Math.sin(angle),
    y: point.x * Math.sin(angle) + point.y * Math.cos(angle),
    z: point.z,
  };
}

function transformPoint(point: { x: number; y: number; z: number }, time: number) {
  let p = rotateY(point, time * ANIMATION.TETRA_ROTATION_Y);
  p = rotateX(p, time * ANIMATION.TETRA_ROTATION_X);
  p = rotateZ(p, time * ANIMATION.TETRA_ROTATION_Z);
  return p;
}

export function AnimatedTetrahedron() {
  const { canvasRef } = useAnimation({
    render: (ctx, width, height, time) => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) * ANIMATION.TETRA_SCALE_RATIO;

      ctx.font = `${ANIMATION.TETRA_FONT_SIZE}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const points: { x: number; y: number; z: number; char: string }[] = [];

      // Points along edges
      for (const [i, j] of EDGES) {
        const v1 = VERTICES[i]!;
        const v2 = VERTICES[j]!;

        for (let t = 0; t <= 1; t += ANIMATION.TETRA_EDGE_STEP) {
          const raw = {
            x: v1.x + (v2.x - v1.x) * t,
            y: v1.y + (v2.y - v1.y) * t,
            z: v1.z + (v2.z - v1.z) * t,
          };
          const p = transformPoint(raw, time);
          const depth = (p.z + ANIMATION.TETRA_DEPTH_RANGE) / (ANIMATION.TETRA_DEPTH_RANGE * 2);
          const charIndex = Math.floor(depth * (CHARS.length - 1));

          points.push({
            x: centerX + p.x * scale,
            y: centerY - p.y * scale,
            z: p.z,
            char: CHARS[Math.min(charIndex, CHARS.length - 1)]!,
          });
        }
      }

      // Points on faces
      for (const [i, j, k] of FACES) {
        const v1 = VERTICES[i]!;
        const v2 = VERTICES[j]!;
        const v3 = VERTICES[k]!;

        for (let u = 0; u <= 1; u += ANIMATION.TETRA_FACE_STEP) {
          for (let v = 0; v <= 1 - u; v += ANIMATION.TETRA_FACE_STEP) {
            const w = 1 - u - v;
            const raw = {
              x: v1.x * u + v2.x * v + v3.x * w,
              y: v1.y * u + v2.y * v + v3.y * w,
              z: v1.z * u + v2.z * v + v3.z * w,
            };
            const p = transformPoint(raw, time);
            const depth = (p.z + ANIMATION.TETRA_DEPTH_RANGE) / (ANIMATION.TETRA_DEPTH_RANGE * 2);
            const charIndex = Math.floor(depth * (CHARS.length - 1));

            points.push({
              x: centerX + p.x * scale,
              y: centerY - p.y * scale,
              z: p.z,
              char: CHARS[Math.min(charIndex, CHARS.length - 1)]!,
            });
          }
        }
      }

      points.sort((a, b) => a.z - b.z);

      for (const point of points) {
        const alpha = Math.min(
          ANIMATION.ALPHA_MIN +
            (point.z + ANIMATION.TETRA_DEPTH_RANGE) * ANIMATION.ALPHA_TETRA_RANGE,
          0.9,
        );
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.fillText(point.char, point.x, point.y);
      }
    },
  });

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />;
}

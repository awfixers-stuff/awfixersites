"use client";

import { useAnimation, ANIMATION } from "@awfixersites/ui/hooks/use-animation";

const CHARS = ANIMATION.CHARS_DOT;

export function AnimatedWave() {
  const { canvasRef } = useAnimation({
    render: (ctx, width, height, time) => {
      ctx.clearRect(0, 0, width, height);

      const cellSize = ANIMATION.WAVE_CELL_SIZE;
      const cols = Math.ceil(width / cellSize);
      const rows = Math.ceil(height / cellSize);

      ctx.font = `${ANIMATION.WAVE_FONT_SIZE}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * cellSize + cellSize / 2;
          const y = row * cellSize + cellSize / 2;

          const wave1 =
            Math.sin(col * ANIMATION.WAVE_WAVE1_X + time * ANIMATION.WAVE_WAVE1_TIME) *
            Math.sin(row * ANIMATION.WAVE_WAVE1_Y + time * ANIMATION.WAVE_WAVE1_TIME);
          const wave2 =
            Math.sin(col * ANIMATION.WAVE_WAVE2_FACTOR + time * ANIMATION.WAVE_WAVE2_TIME) *
            Math.cos(row * ANIMATION.WAVE_WAVE2_FACTOR + time * ANIMATION.WAVE_WAVE2_TIME);
          const wave3 =
            Math.sin((col + row) * ANIMATION.WAVE_WAVE3_X + time * ANIMATION.WAVE_WAVE3_TIME) *
            ANIMATION.WAVE_WAVE3_Y;

          const combined = (wave1 + wave2 + wave3 + 3) / 6;
          const charIndex = Math.floor(combined * (CHARS.length - 1));
          const alpha = ANIMATION.ALPHA_MIN + combined * ANIMATION.ALPHA_RANGE;

          ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
          ctx.fillText(CHARS[charIndex]!, x, y);
        }
      }
    },
  });

  return <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />;
}

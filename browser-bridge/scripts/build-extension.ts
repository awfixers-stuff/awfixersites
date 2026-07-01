import { mkdir, cp, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const dist = join(root, "extension", "dist");

// 16x16 blue square PNG
const ICON_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6aAAAAAElFTkSuQmCC",
  "base64",
);

await mkdir(dist, { recursive: true });
await mkdir(join(dist, "popup"), { recursive: true });
await mkdir(join(dist, "icons"), { recursive: true });

const result = await Bun.build({
  entrypoints: [
    join(root, "extension/src/background.ts"),
    join(root, "extension/src/content-script.ts"),
  ],
  outdir: dist,
  target: "browser",
  format: "esm",
  sourcemap: "inline",
  naming: "[name].[ext]",
});

if (!result.success) {
  console.error(result.logs);
  process.exit(1);
}

await cp(join(root, "extension", "manifest.json"), join(dist, "manifest.json"));
await cp(join(root, "extension", "popup"), join(dist, "popup"), { recursive: true });

for (const size of [16, 48, 128] as const) {
  await writeFile(join(dist, "icons", `icon${size}.png`), ICON_PNG);
}

console.log(`Extension built at ${dist}`);
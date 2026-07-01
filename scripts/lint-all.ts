#!/usr/bin/env bun
/**
 * Lint the full repository (standard + security configs).
 */
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dir, "..");

const passes = [
  { config: "./src/lint.json", name: "lint" },
  { config: "./src/lint.security.json", name: "lint:security" },
] as const;

const failures: string[] = [];

for (const pass of passes) {
  console.log(`[lint] full repo (${pass.name})`);
  const proc = Bun.spawn(
    ["oxlint", "-c", pass.config, ".", "--no-error-on-unmatched-pattern"],
    {
      cwd: repoRoot,
      env: process.env,
      stdout: "inherit",
      stderr: "inherit",
    },
  );
  if ((await proc.exited) !== 0) failures.push(pass.name);
}

if (failures.length > 0) {
  console.error(`[lint] failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("[lint] full repo passed");
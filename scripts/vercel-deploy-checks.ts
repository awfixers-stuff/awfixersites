#!/usr/bin/env bun
/**
 * Vercel pre-build gate: lint, format, and typecheck must pass or the deploy aborts.
 * Invoked from each app's vercel.ts buildCommand before vercel-build.ts.
 */
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const appDir = process.cwd();

const lintConfig = resolve(repoRoot, "src/lint.json");
const fmtConfig = resolve(repoRoot, "src/fmt.json");

const run = async (label: string, cmd: string[], cwd: string) => {
  console.log(`[vercel-deploy-checks] ${label}`);
  const proc = Bun.spawn(cmd, {
    cwd,
    env: process.env,
    stdout: "inherit",
    stderr: "inherit",
  });
  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`${label} failed (exit ${code})`);
  }
};

const tsgo = resolve(repoRoot, "node_modules/.bin/tsgo");

await run("oxlint", ["bunx", "oxlint", "-c", lintConfig, ".", "--max-warnings=0"], appDir);
await run("oxfmt", ["bunx", "oxfmt", "-c", fmtConfig, ".", "--check"], appDir);
await run("typecheck", [tsgo, "-p", "tsconfig.json", "--noEmit"], appDir);

console.log("[vercel-deploy-checks] all checks passed");

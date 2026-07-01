#!/usr/bin/env bun
/**
 * App build: load root `.env.local`, generate Prisma clients for depended workspace packages, then `next build`.
 * Invoked from each app's `build` script.
 */
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadRootEnvLocal } from "./load-root-env.ts";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const appDir = process.cwd();

loadRootEnvLocal();

const pkgPath = resolve(appDir, "package.json");
const pkg = (await Bun.file(pkgPath).json()) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
const deps = { ...pkg.dependencies, ...pkg.devDependencies };

const runGenerate = async (workspacePath: string, label: string) => {
  const cwd = resolve(repoRoot, workspacePath);
  console.log(`[vercel-build] prisma generate — ${label}`);
  const proc = Bun.spawn(["bun", "run", "generate"], {
    cwd,
    env: process.env,
    stdout: "inherit",
    stderr: "inherit",
  });
  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`prisma generate failed for ${label} (exit ${code})`);
  }
};

if (deps["@awfixersites/auth"]) {
  await runGenerate("packages/auth", "@awfixersites/auth");
}
if (deps["@awfixersites/db"]) {
  await runGenerate("packages/db", "@awfixersites/db");
}

console.log("[vercel-build] next build");
const nextBuild = Bun.spawn(["bun", "--bun", "run", "next", "build"], {
  cwd: appDir,
  env: process.env,
  stdout: "inherit",
  stderr: "inherit",
});
const buildCode = await nextBuild.exited;
process.exit(buildCode === 0 ? 0 : buildCode);

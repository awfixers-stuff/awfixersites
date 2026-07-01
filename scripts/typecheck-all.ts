#!/usr/bin/env bun
/**
 * Typecheck every workspace package that defines tsconfig.json (from repo root).
 */
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dir, "..");

function listWorkspaces(subdir: "apps" | "packages"): string[] {
  const base = resolve(repoRoot, subdir);
  if (!existsSync(base)) return [];
  return readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => `${subdir}/${d.name}`);
}

const workspaceRoots = [...listWorkspaces("apps"), ...listWorkspaces("packages")];

const failures: string[] = [];

for (const rel of workspaceRoots.sort()) {
  const dir = resolve(repoRoot, rel);
  const tsconfig = resolve(dir, "tsconfig.json");
  if (!existsSync(tsconfig)) continue;

  console.log(`[typecheck] ${rel}`);
  const proc = Bun.spawn(["tsgo", "-p", tsconfig, "--noEmit", "--pretty"], {
    cwd: dir,
    env: process.env,
    stdout: "inherit",
    stderr: "inherit",
  });
  const code = await proc.exited;
  if (code !== 0) failures.push(rel);
}

if (failures.length > 0) {
  console.error(`[typecheck] failed: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("[typecheck] all workspaces passed");

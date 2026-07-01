#!/usr/bin/env bun
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadRootEnvLocal } from "./load-root-env.ts";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");

loadRootEnvLocal();

const targets = process.argv.slice(2);
const all = targets.length === 0 || targets.includes("all");

const runPush = async (workspacePath: string, label: string) => {
  const cwd = resolve(repoRoot, workspacePath);
  console.log(`[prisma-push] ${label}`);
  const proc = Bun.spawn(["bun", "run", "push"], {
    cwd,
    env: process.env,
    stdout: "inherit",
    stderr: "inherit",
  });
  const code = await proc.exited;
  if (code !== 0) process.exit(code);
};

if (all || targets.includes("auth")) {
  await runPush("packages/auth", "packages/auth");
}
if (all || targets.includes("db")) {
  await runPush("packages/db", "packages/db");
}

if (!all && !targets.some((t) => t === "auth" || t === "db")) {
  console.error("Usage: bun scripts/prisma-push.ts [auth] [db] | all");
  process.exit(1);
}

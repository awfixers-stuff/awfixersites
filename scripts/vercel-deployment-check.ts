#!/usr/bin/env bun
/**
 * Run a single workspace check for Vercel Deployment Checks (GitHub commit status).
 *
 * Usage:
 *   bun scripts/vercel-deployment-check.ts --project awfixersites-careers --check lint
 *   bun scripts/vercel-deployment-check.ts --list
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import {
  type VercelDeploymentCheck,
  deploymentCheckStatusName,
  listVercelDeploymentChecks,
  resolveWorkspaceForVercelProject,
} from "../src/vercel-deployment-checks.ts";

const repoRoot = resolve(import.meta.dir, "..");

function usage(): never {
  console.error(`Usage:
  bun scripts/vercel-deployment-check.ts --project <vercel-project-name> --check lint|typecheck
  bun scripts/vercel-deployment-check.ts --list`);
  process.exit(1);
}

function parseArgs() {
  const args = process.argv.slice(2);
  let project: string | undefined;
  let check: VercelDeploymentCheck | undefined;
  let list = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--list") list = true;
    else if (arg === "--project") project = args[++i];
    else if (arg === "--check") {
      const value = args[++i];
      if (value === "lint" || value === "typecheck") check = value;
    } else usage();
  }

  return { project, check, list };
}

async function runLint(workspace: string) {
  const configs = [
    { config: "./src/lint.json", label: "lint" },
    { config: "./src/lint.security.json", label: "lint:security" },
  ] as const;

  const failures: string[] = [];

  for (const pass of configs) {
    console.log(`[vercel-check] ${workspace} (${pass.label})`);
    const proc = Bun.spawn(
      ["bunx", "oxlint", "-c", pass.config, workspace, "--no-error-on-unmatched-pattern"],
      {
        cwd: repoRoot,
        env: process.env,
        stdout: "inherit",
        stderr: "inherit",
      },
    );
    if ((await proc.exited) !== 0) failures.push(pass.label);
  }

  if (failures.length > 0) {
    console.error(`[vercel-check] lint failed for ${workspace}: ${failures.join(", ")}`);
    process.exit(1);
  }
}

async function runTypecheck(workspace: string) {
  const tsconfig = resolve(repoRoot, workspace, "tsconfig.json");
  if (!existsSync(tsconfig)) {
    console.error(`[vercel-check] missing tsconfig for ${workspace}`);
    process.exit(1);
  }

  console.log(`[vercel-check] ${workspace} (typecheck)`);
  const proc = Bun.spawn(["bunx", "tsgo", "-p", tsconfig, "--noEmit", "--pretty"], {
    cwd: resolve(repoRoot, workspace),
    env: process.env,
    stdout: "inherit",
    stderr: "inherit",
  });

  if ((await proc.exited) !== 0) {
    console.error(`[vercel-check] typecheck failed for ${workspace}`);
    process.exit(1);
  }
}

const { project, check, list } = parseArgs();

if (list) {
  for (const entry of listVercelDeploymentChecks(repoRoot)) {
    console.log(`${entry.name} → ${entry.workspace}`);
  }
  process.exit(0);
}

if (!project || !check) usage();

const workspace = resolveWorkspaceForVercelProject(project, repoRoot);
if (!workspace) {
  console.error(`[vercel-check] unknown Vercel project: ${project}`);
  console.error("Known projects:");
  for (const entry of listVercelDeploymentChecks(repoRoot)) {
    console.error(`  - ${entry.project} → ${entry.workspace}`);
  }
  process.exit(1);
}

console.log(`[vercel-check] ${deploymentCheckStatusName(project, check)} → ${workspace}`);

if (check === "lint") {
  await runLint(workspace);
} else {
  await runTypecheck(workspace);
}

console.log(`[vercel-check] passed: ${deploymentCheckStatusName(project, check)}`);

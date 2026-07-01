#!/usr/bin/env bun
/**
 * Slim app package.json dependencies to runtime-only deps (P0 deploy-check fix).
 * Run once from repo root: bun scripts/slim-app-deps.ts
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dir, "..");
const appsDir = resolve(repoRoot, "apps");

const BASE_DEPS: Record<string, string> = {
  "@awfixersites/ui": "catalog:",
  "@tailwindcss/postcss": "catalog:",
  "class-variance-authority": "catalog:",
  clsx: "catalog:",
  "lucide-react": "catalog:",
  motion: "catalog:",
  next: "catalog:",
  "next-themes": "catalog:",
  "radix-ui": "catalog:",
  react: "catalog:",
  "react-dom": "catalog:",
  shadcn: "catalog:",
  "tailwind-merge": "catalog:",
  tailwindcss: "catalog:",
  "tw-animate-css": "catalog:",
};

const WORKSPACE_EXTRAS: Record<string, Record<string, string>> = {
  army: {
    "@awfixersites/auth": "catalog:",
    "@awfixersites/content": "catalog:",
    "@awfixersites/db": "catalog:",
    "@awfixersites/mdx": "catalog:",
  },
  "auth-app": {
    "@awfixersites/auth": "catalog:",
  },
  auth: {
    "@awfixersites/auth": "catalog:",
  },
  church: {
    "@awfixersites/auth": "catalog:",
  },
  legal: {
    "@awfixersites/mdx": "catalog:",
    "@tailwindcss/typography": "catalog:",
  },
  tips: {
    "@hookform/resolvers": "catalog:",
    "react-hook-form": "catalog:",
    resend: "catalog:",
    zod: "catalog:",
  },
};

const ANALYTICS_BOTH = new Set(["auth", "careers", "church", "codes", "legal", "llc"]);
const ANALYTICS_ONLY = new Set(["tips"]);

function depsForApp(appName: string, pkgName: string): Record<string, string> {
  const deps = { ...BASE_DEPS, ...(WORKSPACE_EXTRAS[appName] ?? WORKSPACE_EXTRAS[pkgName] ?? {}) };

  if (ANALYTICS_BOTH.has(appName)) {
    deps["@vercel/analytics"] = "catalog:";
    deps["@vercel/speed-insights"] = "catalog:";
  } else if (ANALYTICS_ONLY.has(appName)) {
    deps["@vercel/analytics"] = "catalog:";
  }

  const sorted = Object.keys(deps).sort();
  return Object.fromEntries(sorted.map((key) => [key, deps[key]!]));
}

const BUN_VERSION = "1.3.14";

for (const dirent of readdirSync(appsDir, { withFileTypes: true })) {
  if (!dirent.isDirectory()) continue;

  const appName = dirent.name;
  const pkgPath = resolve(appsDir, appName, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as Record<string, unknown>;

  pkg.dependencies = depsForApp(appName, pkg.name as string);
  pkg.scripts = {
    ...(pkg.scripts as Record<string, string>),
    lint: "oxlint -c ../../src/lint.json .",
    "lint:fix": "oxlint -c ../../src/lint.json . --fix",
  };
  pkg.devEngines = {
    packageManager: { name: "bun", version: BUN_VERSION, onFail: "error" },
    runtime: { name: "bun", version: BUN_VERSION, onFail: "error" },
  };
  pkg.engines = { bun: BUN_VERSION };
  pkg.packageManager = `bun@${BUN_VERSION}`;

  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(
    `[slim-app-deps] ${appName} — ${Object.keys(pkg.dependencies as object).length} deps`,
  );
}

const packagesDir = resolve(repoRoot, "packages");
for (const dirent of readdirSync(packagesDir, { withFileTypes: true })) {
  if (!dirent.isDirectory()) continue;

  const pkgPath = resolve(packagesDir, dirent.name, "package.json");
  if (!readFileSync(pkgPath, "utf8").includes("oxlint")) continue;

  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as Record<string, unknown>;
  pkg.scripts = {
    ...(pkg.scripts as Record<string, string>),
    lint: "oxlint -c ../../src/lint.json .",
    "lint:fix": "oxlint -c ../../src/lint.json . --fix",
  };
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log(`[slim-app-deps] packages/${dirent.name} — lint scripts`);
}

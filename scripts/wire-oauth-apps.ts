#!/usr/bin/env bun
/**
 * Wire OAuth client boilerplate into every satellite app (all apps/* except auth).
 * Run from repo root: bun scripts/wire-oauth-apps.ts
 *
 * After scaffolding a new app, also run: bun scripts/apply-botid-apps.ts
 * (wraps next.config with withBotId + adds instrumentation-client.ts for Vercel BotID).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dir, "..");
const appsDir = resolve(repoRoot, "apps");

const SIGN_IN_PAGE = `import Link from "next/link";
import { Suspense } from "react";

import { IdpSignInWithReturn } from "@awfixersites/ui/auth/idp-sign-in-with-return";

export const metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your AWFixer account via auth.awfixer.me.
          </p>
        </div>

        <Suspense fallback={<div className="h-48" />}>
          <IdpSignInWithReturn />
        </Suspense>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
`;

const SIGN_UP_PAGE = `import { redirect } from "next/navigation";

import { getIdpSignInUrl } from "@awfixersites/auth/idp";

export const metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  const url = new URL(getIdpSignInUrl());
  url.searchParams.set("mode", "sign-up");
  redirect(url.toString());
}
`;

const AUTH_ROUTE = `export { GET, POST, PATCH, PUT, DELETE } from "@awfixersites/auth/auth-api-route";
`;

const ENV_EXAMPLE = `AUTH_DEPLOYMENT_ROLE=client
AUTH_OAUTH_SITE_KEY=
AUTH_CLIENT_DATABASE_URL=
AUTH_IDP_URL=https://auth.awfixer.me
NEXT_PUBLIC_AUTH_IDP_URL=https://auth.awfixer.me
NEXT_PUBLIC_API_URL=https://api.awfixer.me
NEXT_PUBLIC_AUTH_API_URL=https://api.awfixer.me/oauth
`;

function ensureDir(path: string) {
  mkdirSync(path, { recursive: true });
}

function writeIfMissing(path: string, content: string) {
  if (existsSync(path)) return false;
  writeFileSync(path, content);
  return true;
}

function patchNextConfig(appDir: string) {
  const configPath = resolve(appDir, "next.config.ts");
  if (!existsSync(configPath)) return;

  let content = readFileSync(configPath, "utf8");
  if (content.includes("@awfixersites/auth")) return;

  if (content.includes('transpilePackages: ["@awfixersites/ui"]')) {
    content = content.replace(
      'transpilePackages: ["@awfixersites/ui"]',
      'transpilePackages: ["@awfixersites/ui", "@awfixersites/auth"]',
    );
  } else if (content.includes("transpilePackages:")) {
    content = content.replace(
      /transpilePackages:\s*\[([^\]]*)\]/,
      'transpilePackages: [$1, "@awfixersites/auth"]',
    );
  } else {
    content = content.replace(
      "const nextConfig: NextConfig = {",
      'const nextConfig: NextConfig = {\n  transpilePackages: ["@awfixersites/ui", "@awfixersites/auth"],',
    );
  }

  writeFileSync(configPath, content);
}

function patchTsconfig(appDir: string) {
  const configPath = resolve(appDir, "tsconfig.json");
  if (!existsSync(configPath)) return;

  const json = JSON.parse(readFileSync(configPath, "utf8")) as {
    compilerOptions?: { paths?: Record<string, string[]> };
  };
  json.compilerOptions ??= {};
  json.compilerOptions.paths ??= {};
  json.compilerOptions.paths["@awfixersites/auth"] = ["../../packages/auth/src/index.ts"];
  json.compilerOptions.paths["@awfixersites/auth/*"] = ["../../packages/auth/src/*"];
  writeFileSync(configPath, `${JSON.stringify(json, null, 2)}\n`);
}

function patchPackageJson(appDir: string, appName: string) {
  const pkgPath = resolve(appDir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
    dependencies?: Record<string, string>;
  };
  pkg.dependencies ??= {};
  if (!pkg.dependencies["@awfixersites/auth"]) {
    pkg.dependencies["@awfixersites/auth"] = "catalog:workspace";
    const sorted = Object.keys(pkg.dependencies).sort();
    pkg.dependencies = Object.fromEntries(sorted.map((key) => [key, pkg.dependencies![key]!]));
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    console.log(`[wire-oauth] ${appName} — added @awfixersites/auth dependency`);
  }
}

for (const dirent of readdirSync(appsDir, { withFileTypes: true })) {
  if (!dirent.isDirectory() || dirent.name === "auth" || dirent.name === "api") continue;

  const appName = dirent.name;
  const appDir = resolve(appsDir, appName);

  patchPackageJson(appDir, appName);
  patchNextConfig(appDir);
  patchTsconfig(appDir);

  const authApiDir = resolve(appDir, "app/api/auth/[...all]");
  ensureDir(authApiDir);
  const wroteRoute = writeIfMissing(resolve(authApiDir, "route.ts"), AUTH_ROUTE);

  const authPagesDir = resolve(appDir, "app/(auth)");
  ensureDir(resolve(authPagesDir, "sign-in"));
  ensureDir(resolve(authPagesDir, "sign-up"));
  const wroteSignIn = writeIfMissing(resolve(authPagesDir, "sign-in/page.tsx"), SIGN_IN_PAGE);
  const wroteSignUp = writeIfMissing(resolve(authPagesDir, "sign-up/page.tsx"), SIGN_UP_PAGE);

  const envExamplePath = resolve(appDir, ".env.example");
  if (!existsSync(envExamplePath)) {
    const envContent = ENV_EXAMPLE.replace(
      "AUTH_OAUTH_SITE_KEY=",
      `AUTH_OAUTH_SITE_KEY=${appName}`,
    );
    writeFileSync(envExamplePath, envContent);
  }

  console.log(
    `[wire-oauth] ${appName} — route:${wroteRoute ? "new" : "exists"} sign-in:${wroteSignIn ? "new" : "exists"} sign-up:${wroteSignUp ? "new" : "exists"}`,
  );
}

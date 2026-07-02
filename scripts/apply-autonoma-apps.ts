#!/usr/bin/env bun
/**
 * Wire Autonoma-ready template configs into every non-bootstrapped app (+ template).
 * Run from repo root: bun scripts/apply-autonoma-apps.ts
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { resolve } from "node:path";

import { listAutonomaTargetApps } from "./autonoma/targets.ts";

const repoRoot = resolve(import.meta.dir, "..");

const MIDDLEWARE = `import { createAppSecurityMiddleware } from "@awfixersites/security/middleware";
import { NextRequest, NextResponse } from "next/server";

import { arcjet } from "@/lib/security";

const middleware = arcjet
  ? createAppSecurityMiddleware(arcjet)
  : function passthrough(_request: NextRequest) {
      return NextResponse.next();
    };

export default middleware;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\\\..*).*)"],
};
`;

const SECURITY = `import { shield } from "@awfixersites/security/arcjet/next";
import { createAppArcjet } from "@awfixersites/security/client";

export const arcjet = createAppArcjet({
  rules: [shield({ mode: "DRY_RUN" })],
});
`;

const APP_UTILS = `"use client";

import { StreamdownStyles } from "@awfixersites/utils/streamdown";

function AppUtils() {
  return <StreamdownStyles />;
}

export { AppUtils };
`;

function patchPackageJson(appDir: string): boolean {
  const path = resolve(appDir, "package.json");
  const pkg = JSON.parse(readFileSync(path, "utf8")) as {
    dependencies?: Record<string, string>;
  };
  pkg.dependencies ??= {};
  let changed = false;
  for (const dep of ["@awfixersites/security", "@awfixersites/utils"]) {
    if (!pkg.dependencies[dep]) {
      pkg.dependencies[dep] = "catalog:workspace";
      changed = true;
    }
  }
  if (!changed) return false;
  pkg.dependencies = Object.fromEntries(
    Object.entries(pkg.dependencies).sort(([a], [b]) => a.localeCompare(b)),
  );
  writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
  return true;
}

function writeIfMissing(path: string, content: string): boolean {
  if (existsSync(path)) return false;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  return true;
}

function patchNextConfig(appDir: string): boolean {
  const path = resolve(appDir, "next.config.ts");
  if (!existsSync(path)) return false;
  let content = readFileSync(path, "utf8");
  let changed = false;

  if (!content.includes('from "@awfixersites/utils/next-config"')) {
    content = `import { withAppUtils } from "@awfixersites/utils/next-config";\n${content}`;
    changed = true;
  }

  if (!content.includes("@awfixersites/security")) {
    content = content.replace(
      /transpilePackages:\s*\[/,
      'transpilePackages: ["@awfixersites/security", "@awfixersites/utils", ',
    );
    changed = true;
  } else if (!content.includes("@awfixersites/utils")) {
    content = content.replace(
      /transpilePackages:\s*\[/,
      'transpilePackages: ["@awfixersites/utils", ',
    );
    changed = true;
  }

  if (!content.includes("withAppUtils(")) {
    if (/export default withBotId\(/.test(content)) {
      content = content.replace(
        /export default withBotId\(/,
        "export default withAppUtils(withBotId(",
      );
      content = content.replace(/\);\s*$/m, "));");
    } else if (/export default (\w+);/.test(content)) {
      content = content.replace(/export default (\w+);/, "export default withAppUtils($1);");
    }
    changed = true;
  }

  if (changed) writeFileSync(path, content);
  return changed;
}

function patchLayout(appDir: string): boolean {
  const path = resolve(appDir, "app/layout.tsx");
  if (!existsSync(path)) return false;
  let content = readFileSync(path, "utf8");
  if (content.includes("AppUtils")) return false;

  if (!content.includes('@/components/app-utils"')) {
    const importLine = 'import { AppUtils } from "@/components/app-utils";\n';
    const lastImport = content.lastIndexOf("\nimport ");
    if (lastImport === -1) content = `${importLine}${content}`;
    else {
      const end = content.indexOf("\n", lastImport + 1);
      content = `${content.slice(0, end + 1)}${importLine}${content.slice(end + 1)}`;
    }
  }

  if (content.includes("<Analytics />")) {
    content = content.replace("<Analytics />", "<AppUtils />\n        <Analytics />");
  } else if (content.includes("</body>")) {
    content = content.replace("</body>", "        <AppUtils />\n      </body>");
  } else {
    return false;
  }

  writeFileSync(path, content);
  return true;
}

for (const app of listAutonomaTargetApps(repoRoot)) {
  const appDir = resolve(repoRoot, app.workspace);
  const results = {
    "package.json": patchPackageJson(appDir),
    "middleware.ts": writeIfMissing(resolve(appDir, "middleware.ts"), MIDDLEWARE),
    "lib/security.ts": writeIfMissing(resolve(appDir, "lib/security.ts"), SECURITY),
    "components/app-utils.tsx": writeIfMissing(
      resolve(appDir, "components/app-utils.tsx"),
      APP_UTILS,
    ),
    "next.config.ts": patchNextConfig(appDir),
    "app/layout.tsx": patchLayout(appDir),
  };

  const applied = Object.entries(results)
    .filter(([, changed]) => changed)
    .map(([file]) => file);
  if (applied.length > 0) {
    console.log(`${app.name}: ${applied.join(", ")}`);
  }
}

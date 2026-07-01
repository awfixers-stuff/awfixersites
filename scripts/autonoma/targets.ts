import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { listAutonomaApps, type AutonomaAppEntry } from "./apps.ts";

const BOOTSTRAP_PAGE_MARKER = "Project ready!";

/** Default shadcn scaffold — skip until the app has real UI. */
export function isBootstrappedApp(appDir: string): boolean {
  const pagePath = resolve(appDir, "app/page.tsx");
  if (!existsSync(pagePath)) return false;
  return readFileSync(pagePath, "utf8").includes(BOOTSTRAP_PAGE_MARKER);
}

/** Apps to wire for Autonoma checks: all non-bootstrapped apps + always template. */
export function listAutonomaTargetApps(repoRoot: string): AutonomaAppEntry[] {
  return listAutonomaApps(repoRoot).filter((app) => {
    if (app.name === "template") return true;
    const appDir = resolve(repoRoot, app.workspace);
    return !isBootstrappedApp(appDir);
  });
}

export function listBootstrappedApps(repoRoot: string): AutonomaAppEntry[] {
  return listAutonomaApps(repoRoot).filter((app) => {
    if (app.name === "template") return false;
    return isBootstrappedApp(resolve(repoRoot, app.workspace));
  });
}
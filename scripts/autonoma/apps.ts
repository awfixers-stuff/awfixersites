import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export type AutonomaAppEntry = {
  /** Previewkit / stack app name (matches apps/<dir>) */
  name: string;
  workspace: string;
  vercelProject: string;
};

function parseVercelProjectName(vercelTsPath: string): string | null {
  const content = readFileSync(vercelTsPath, "utf8");
  const match = content.match(/name:\s*["']([^"']+)["']/);
  return match?.[1] ?? null;
}

/** Discover deployable apps from each apps/<name>/vercel.ts file. */
export function listAutonomaApps(repoRoot: string): AutonomaAppEntry[] {
  const appsDir = resolve(repoRoot, "apps");
  const entries: AutonomaAppEntry[] = [];

  for (const dirent of readdirSync(appsDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;

    const vercelTs = resolve(appsDir, dirent.name, "vercel.ts");
    if (!existsSync(vercelTs)) continue;

    const vercelProject = parseVercelProjectName(vercelTs);
    if (!vercelProject) continue;

    entries.push({
      name: dirent.name,
      workspace: `apps/${dirent.name}`,
      vercelProject,
    });
  }

  return entries.toSorted((a, b) => a.name.localeCompare(b.name));
}

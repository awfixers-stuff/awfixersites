import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export type VercelDeploymentCheck = "lint" | "typecheck";

const CHECK_LABEL: Record<VercelDeploymentCheck, string> = {
  lint: "lint",
  typecheck: "typecheck",
};

/** Commit status name Vercel Deployment Checks must match exactly. */
export function deploymentCheckStatusName(
  vercelProjectName: string,
  check: VercelDeploymentCheck,
): string {
  return `Vercel - ${vercelProjectName}: ${CHECK_LABEL[check]}`;
}

function parseVercelProjectName(vercelTsPath: string): string | null {
  const content = readFileSync(vercelTsPath, "utf8");
  const match = content.match(/name:\s*["']([^"']+)["']/);
  return match?.[1] ?? null;
}

/** Build Vercel project name → workspace path (e.g. `awfixersites-careers` → `apps/careers`). */
export function buildVercelProjectRegistry(
  repoRoot = resolve(import.meta.dir, ".."),
): Map<string, string> {
  const appsDir = resolve(repoRoot, "apps");
  const registry = new Map<string, string>();

  for (const dirent of readdirSync(appsDir, { withFileTypes: true })) {
    if (!dirent.isDirectory()) continue;

    const workspace = `apps/${dirent.name}`;
    const vercelTs = resolve(appsDir, dirent.name, "vercel.ts");
    if (!existsSync(vercelTs)) continue;

    const projectName = parseVercelProjectName(vercelTs);
    if (!projectName) continue;

    registry.set(projectName, workspace);
  }

  return registry;
}

export function resolveWorkspaceForVercelProject(
  vercelProjectName: string,
  repoRoot?: string,
): string | null {
  const registry = buildVercelProjectRegistry(repoRoot);
  return registry.get(vercelProjectName) ?? null;
}

export function listVercelDeploymentChecks(repoRoot?: string) {
  const registry = buildVercelProjectRegistry(repoRoot);
  const checks: Array<{
    project: string;
    workspace: string;
    check: VercelDeploymentCheck;
    name: string;
  }> = [];

  for (const [project, workspace] of registry.entries()) {
    for (const check of ["lint", "typecheck"] as const) {
      checks.push({
        project,
        workspace,
        check,
        name: deploymentCheckStatusName(project, check),
      });
    }
  }

  return checks.toSorted((a, b) => a.name.localeCompare(b.name));
}

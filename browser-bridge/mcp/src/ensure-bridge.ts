import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, userInfo } from "node:os";
import { dirname, join } from "node:path";

const HOST = process.env.BROWSER_BRIDGE_HOST ?? "127.0.0.1";
const PORT = Number(process.env.BROWSER_BRIDGE_PORT ?? "18793");
const HEALTH_URL = `http://${HOST}:${PORT}/healthz`;
const BRIDGE_ROOT = join(import.meta.dir, "../..");

async function isHealthy(): Promise<boolean> {
  try {
    const response = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(2000) });
    return response.ok;
  } catch {
    return false;
  }
}

function loadToken(): string | undefined {
  const fromEnv = process.env.BROWSER_BRIDGE_TOKEN?.trim();
  if (fromEnv) return fromEnv;

  try {
    const token = readFileSync(join(BRIDGE_ROOT, ".bridge-token"), "utf8").trim();
    return token || undefined;
  } catch {
    return undefined;
  }
}

function pidFilePath(): string {
  const runtimeDir = process.env.XDG_RUNTIME_DIR ?? "/tmp";
  return join(runtimeDir, `browser-bridge-ws-${userInfo().uid}.pid`);
}

function logFilePath(): string {
  const logFile =
    process.env.BROWSER_BRIDGE_BRIDGE_LOG_FILE ??
    join(homedir(), ".grok/logs/browser-bridge-ws.log");
  mkdirSync(dirname(logFile), { recursive: true });
  return logFile;
}

export async function ensureExtensionBridge(): Promise<void> {
  if (await isHealthy()) return;

  const logFile = logFilePath();
  const bridgeServer = join(import.meta.dir, "bridge-server.ts");
  const token = loadToken();

  const proc = Bun.spawn({
    cmd: ["bun", bridgeServer],
    cwd: BRIDGE_ROOT,
    env: {
      ...process.env,
      BROWSER_BRIDGE_HOST: HOST,
      BROWSER_BRIDGE_PORT: String(PORT),
      ...(token ? { BROWSER_BRIDGE_TOKEN: token } : {}),
    },
    stdout: Bun.file(logFile),
    stderr: Bun.file(logFile),
    detached: true,
  });
  proc.unref();

  try {
    writeFileSync(pidFilePath(), String(proc.pid));
  } catch {
    // Best-effort PID tracking for status.sh.
  }

  for (let attempt = 0; attempt < 40; attempt++) {
    if (await isHealthy()) return;
    await Bun.sleep(250);
  }

  throw new Error(
    `WebSocket bridge failed to start at ${HEALTH_URL}. Check ${logFile} and load browser-bridge/extension/dist in Chrome.`,
  );
}

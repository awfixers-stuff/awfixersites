import { BridgeClient } from "./bridge-client";
import { getRecentLogs, logger } from "./logger";

declare const __BUILD_STAMP__: string | undefined;
const BUILD_STAMP = typeof __BUILD_STAMP__ !== "undefined" ? __BUILD_STAMP__ : "dev";

const STORAGE_KEY = "bridgeConfig";
const BUILD_STAMP_KEY = "lastBuildStamp";

type BridgeConfig = {
  host?: string;
  port?: number;
  token?: string;
  enabled?: boolean;
};

let client: BridgeClient | null = null;

async function getConfig(): Promise<BridgeConfig> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  return (stored[STORAGE_KEY] as BridgeConfig | undefined) ?? { enabled: true };
}

async function saveConfig(config: BridgeConfig) {
  await chrome.storage.local.set({ [STORAGE_KEY]: config });
}

async function startBridge() {
  const config = await getConfig();
  if (config.enabled === false) {
    logger.info("Bridge disabled in config");
    return;
  }

  logger.info("Starting bridge client", {
    host: config.host,
    port: config.port,
    hasToken: Boolean(config.token),
  });

  client?.stop();
  client = new BridgeClient({
    host: config.host,
    port: config.port,
    token: config.token,
    onStatus: (status) => {
      logger.info("Bridge status changed", { status });
      void chrome.storage.local.set({ bridgeStatus: status, bridgeUpdatedAt: Date.now() });
    },
  });
  client.start();
}

chrome.runtime.onInstalled.addListener(() => {
  void startBridge();
});

chrome.runtime.onStartup.addListener(() => {
  void startBridge();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && STORAGE_KEY in changes) {
    void startBridge();
  }
});

async function maybeReloadForNewBuild(): Promise<boolean> {
  const stored = await chrome.storage.local.get(BUILD_STAMP_KEY);
  const lastBuildStamp = stored[BUILD_STAMP_KEY] as string | undefined;
  if (lastBuildStamp && lastBuildStamp !== BUILD_STAMP) {
    await chrome.storage.local.set({ [BUILD_STAMP_KEY]: BUILD_STAMP });
    logger.info("New build detected — reloading extension", { from: lastBuildStamp, to: BUILD_STAMP });
    chrome.runtime.reload();
    return true;
  }
  await chrome.storage.local.set({ [BUILD_STAMP_KEY]: BUILD_STAMP });
  return false;
}

void maybeReloadForNewBuild().then((reloaded) => {
  if (!reloaded) void startBridge();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "getBridgeStatus") {
    void chrome.storage.local
      .get(["bridgeStatus", "bridgeUpdatedAt"])
      .then((stored) => sendResponse({ ...stored, recentLogs: getRecentLogs(20) }));
    return true;
  }
  if (message?.type === "getBridgeLogs") {
    sendResponse({ logs: getRecentLogs(message.limit ?? 50) });
    return true;
  }
  if (message?.type === "setBridgeConfig") {
    void saveConfig(message.config as BridgeConfig)
      .then(() => startBridge())
      .then(() => sendResponse({ ok: true }));
    return true;
  }
  return false;
});

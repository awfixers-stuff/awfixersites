import { BridgeClient } from "./bridge-client";

const STORAGE_KEY = "bridgeConfig";

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
  if (config.enabled === false) return;

  client?.stop();
  client = new BridgeClient({
    host: config.host,
    port: config.port,
    token: config.token,
    onStatus: (status) => {
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

void startBridge();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "getBridgeStatus") {
    void chrome.storage.local.get(["bridgeStatus", "bridgeUpdatedAt"]).then(sendResponse);
    return true;
  }
  if (message?.type === "setBridgeConfig") {
    void saveConfig(message.config as BridgeConfig).then(() => startBridge()).then(() => sendResponse({ ok: true }));
    return true;
  }
  return false;
});
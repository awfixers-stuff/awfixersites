const POPUP_BUILD_STAMP = "__POPUP_BUILD_STAMP__";

const dot = document.getElementById("dot");
const statusText = document.getElementById("status-text");
const portInput = document.getElementById("port");
const tokenInput = document.getElementById("token");
const saveButton = document.getElementById("save");
const revealButton = document.getElementById("reveal");

function renderStatus(status) {
  dot.className = "dot";
  if (status === "connected") {
    dot.classList.add("connected");
    statusText.textContent = "Connected to MCP bridge";
  } else if (status === "connecting") {
    dot.classList.add("connecting");
    statusText.textContent = "Connecting…";
  } else {
    statusText.textContent = "Disconnected — start the MCP gateway";
  }
}

const logsEl = document.getElementById("logs");

async function refresh() {
  const response = await chrome.runtime.sendMessage({ type: "getBridgeStatus" });
  renderStatus(response?.bridgeStatus ?? "disconnected");
  if (logsEl && response?.recentLogs?.length) {
    logsEl.textContent = response.recentLogs
      .map((e) => `${e.ts} [${e.level}] ${e.msg}`)
      .join("\n");
  }
}

revealButton.addEventListener("click", () => {
  const hidden = tokenInput.type === "password";
  tokenInput.type = hidden ? "text" : "password";
  revealButton.textContent = hidden ? "Hide" : "Show";
});

saveButton.addEventListener("click", async () => {
  await chrome.runtime.sendMessage({
    type: "setBridgeConfig",
    config: {
      enabled: true,
      port: Number(portInput.value) || 18793,
      token: tokenInput.value || undefined,
    },
  });
  await refresh();
});

chrome.storage.local.get("bridgeConfig").then((stored) => {
  const config = stored.bridgeConfig ?? {};
  if (config.port) portInput.value = String(config.port);
  if (config.token) tokenInput.value = config.token;
});

async function maybeReloadForNewBuild() {
  const stored = await chrome.storage.local.get("popupBuildStamp");
  if (stored.popupBuildStamp && stored.popupBuildStamp !== POPUP_BUILD_STAMP) {
    await chrome.storage.local.set({ popupBuildStamp: POPUP_BUILD_STAMP });
    chrome.runtime.reload();
    return true;
  }
  await chrome.storage.local.set({ popupBuildStamp: POPUP_BUILD_STAMP });
  return false;
}

void maybeReloadForNewBuild().then((reloaded) => {
  if (!reloaded) {
    void refresh();
    setInterval(() => void refresh(), 2000);
  }
});

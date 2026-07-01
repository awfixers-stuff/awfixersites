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

async function refresh() {
  const response = await chrome.runtime.sendMessage({ type: "getBridgeStatus" });
  renderStatus(response?.bridgeStatus ?? "disconnected");
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

void refresh();
setInterval(() => void refresh(), 2000);
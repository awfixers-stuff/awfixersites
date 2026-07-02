import { ensureExtensionBridge } from "./ensure-bridge";
import { createServerLogger } from "./log-setup";

const { logger } = createServerLogger("bridge", "BROWSER_BRIDGE_BRIDGE_LOG_FILE", "browser-bridge-ws.log");

await ensureExtensionBridge(logger);
logger.info("WebSocket bridge ready", {
  url: `ws://${process.env.BROWSER_BRIDGE_HOST ?? "127.0.0.1"}:${process.env.BROWSER_BRIDGE_PORT ?? "18793"}/extension`,
});

import { ExtensionBridge } from "./bridge";
import { createServerLogger } from "./log-setup";

const { logger, ring, logFile } = createServerLogger(
  "bridge",
  "BROWSER_BRIDGE_BRIDGE_LOG_FILE",
  "browser-bridge-ws.log",
);

const bridge = new ExtensionBridge({
  host: process.env.BROWSER_BRIDGE_HOST ?? "127.0.0.1",
  port: Number(process.env.BROWSER_BRIDGE_PORT ?? "18793"),
  token: process.env.BROWSER_BRIDGE_TOKEN,
  logger,
  logRing: ring,
});

await bridge.start();
logger.info("Extension bridge listening", {
  url: bridge.url,
  logFile,
  tokenConfigured: Boolean(process.env.BROWSER_BRIDGE_TOKEN),
});

async function shutdown() {
  logger.info("Shutting down extension bridge");
  await bridge.stop();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await new Promise<void>(() => {});
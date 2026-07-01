import { ExtensionBridge } from "./bridge";

const bridge = new ExtensionBridge({
  host: process.env.BROWSER_BRIDGE_HOST ?? "127.0.0.1",
  port: Number(process.env.BROWSER_BRIDGE_PORT ?? "18793"),
  token: process.env.BROWSER_BRIDGE_TOKEN,
});

await bridge.start();
console.error(`[browser-bridge] extension bridge listening on ${bridge.url}`);

async function shutdown() {
  await bridge.stop();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
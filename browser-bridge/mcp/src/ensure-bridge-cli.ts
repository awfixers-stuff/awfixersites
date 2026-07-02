import { ensureExtensionBridge } from "./ensure-bridge";

await ensureExtensionBridge();
console.log(
  `WebSocket bridge ready at ws://${process.env.BROWSER_BRIDGE_HOST ?? "127.0.0.1"}:${process.env.BROWSER_BRIDGE_PORT ?? "18793"}/extension`,
);

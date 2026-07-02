export const DEFAULT_BRIDGE_PORT = 18793;
export const DEFAULT_BRIDGE_HOST = "127.0.0.1";

export type BridgeRequest = {
  id: string;
  method: string;
  params?: Record<string, unknown>;
};

export type BridgeResponse = {
  id: string;
  ok: boolean;
  result?: unknown;
  error?: string;
};

export type BridgeEvent = {
  type: "event";
  event: string;
  data: unknown;
};

export type BridgeMessage = BridgeRequest | BridgeResponse | BridgeEvent;

export const BRIDGE_METHODS = [
  "bridge.ping",
  "bridge.status",
  "bridge.logs",
  "tabs.list",
  "tabs.get",
  "tabs.create",
  "tabs.close",
  "tabs.activate",
  "tabs.navigate",
  "tabs.reload",
  "tabs.screenshot",
  "scripting.execute",
  "dom.snapshot",
  "dom.query",
  "interaction.click",
  "interaction.fill",
  "interaction.press",
  "interaction.scroll",
  "interaction.hover",
  "debugger.attach",
  "debugger.detach",
  "debugger.sendCommand",
  "cookies.get",
  "cookies.set",
  "cookies.remove",
  "storage.local.get",
  "storage.local.set",
  "downloads.search",
  "clipboard.read",
  "clipboard.write",
  "console.get",
  "console.batch",
  "observability.enable",
  "observability.get",
  "observability.disable",
  "observability.batch",
  "extension.getInfo",
  "extension.openSettings",
  "extension.reload",
  "extension.clearErrors",
  "extension.reloadFromUI",
  "overlay.find",
  "overlay.click",
] as const;

export type BridgeMethod = (typeof BRIDGE_METHODS)[number];

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RemoteExtensionBridge } from "./bridge";

function textResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

export function registerBrowserTools(server: McpServer, bridge: RemoteExtensionBridge) {
  server.registerTool(
    "bridge_status",
    {
      description: "Check MCP bridge and Chrome extension connection status.",
      inputSchema: {},
    },
    async () => {
      await bridge.refreshStatus();
      const status = await bridge.call("bridge.status").catch((error) => ({
        extensionConnected: bridge.isExtensionConnected,
        error: error instanceof Error ? error.message : String(error),
      }));
      await bridge.refreshStatus();
      return textResult({
        gateway: "ok",
        extensionConnected: bridge.isExtensionConnected,
        extension: status,
      });
    },
  );

  server.registerTool(
    "list_tabs",
    {
      description: "List Chrome tabs. Optionally filter with Chrome tabs.query fields.",
      inputSchema: {
        query: z.record(z.string(), z.unknown()).optional(),
      },
    },
    async ({ query }) => textResult(await bridge.call("tabs.list", { query })),
  );

  server.registerTool(
    "get_tab",
    {
      description: "Get metadata for a tab. Uses active tab when tabId is omitted.",
      inputSchema: {
        tabId: z.number().int().optional(),
      },
    },
    async ({ tabId }) => textResult(await bridge.call("tabs.get", { tabId })),
  );

  server.registerTool(
    "create_tab",
    {
      description: "Open a new tab.",
      inputSchema: {
        url: z.string().url().optional(),
        active: z.boolean().optional(),
        pinned: z.boolean().optional(),
      },
    },
    async (params) => textResult(await bridge.call("tabs.create", params)),
  );

  server.registerTool(
    "close_tab",
    {
      description: "Close a tab by id.",
      inputSchema: {
        tabId: z.number().int(),
      },
    },
    async ({ tabId }) => textResult(await bridge.call("tabs.close", { tabId })),
  );

  server.registerTool(
    "activate_tab",
    {
      description: "Focus a tab and its window.",
      inputSchema: {
        tabId: z.number().int(),
      },
    },
    async ({ tabId }) => textResult(await bridge.call("tabs.activate", { tabId })),
  );

  server.registerTool(
    "navigate",
    {
      description: "Navigate a tab to a URL.",
      inputSchema: {
        url: z.string(),
        tabId: z.number().int().optional(),
      },
    },
    async ({ url, tabId }) => textResult(await bridge.call("tabs.navigate", { url, tabId })),
  );

  server.registerTool(
    "reload_tab",
    {
      description: "Reload a tab.",
      inputSchema: {
        tabId: z.number().int().optional(),
        bypassCache: z.boolean().optional(),
      },
    },
    async (params) => textResult(await bridge.call("tabs.reload", params)),
  );

  server.registerTool(
    "screenshot",
    {
      description: "Capture a visible tab screenshot as a data URL.",
      inputSchema: {
        tabId: z.number().int().optional(),
        format: z.enum(["png", "jpeg"]).optional(),
        quality: z.number().int().min(0).max(100).optional(),
      },
    },
    async (params) => textResult(await bridge.call("tabs.screenshot", params)),
  );

  server.registerTool(
    "execute_script",
    {
      description:
        "Evaluate JavaScript in the page MAIN world. Returns the expression result. Full DOM and page APIs available.",
      inputSchema: {
        expression: z.string(),
        tabId: z.number().int().optional(),
      },
    },
    async ({ expression, tabId }) =>
      textResult(await bridge.call("scripting.execute", { expression, tabId })),
  );

  server.registerTool(
    "take_snapshot",
    {
      description:
        "Get the full accessibility tree for a tab via CDP. More complete than DevTools MCP snapshots on restricted pages.",
      inputSchema: {
        tabId: z.number().int().optional(),
      },
    },
    async ({ tabId }) => textResult(await bridge.call("dom.snapshot", { tabId })),
  );

  server.registerTool(
    "query_elements",
    {
      description: "Query elements by CSS selector with geometry and text metadata.",
      inputSchema: {
        selector: z.string(),
        tabId: z.number().int().optional(),
      },
    },
    async ({ selector, tabId }) =>
      textResult(await bridge.call("dom.query", { selector, tabId })),
  );

  server.registerTool(
    "click",
    {
      description: "Click an element by CSS selector.",
      inputSchema: {
        selector: z.string(),
        tabId: z.number().int().optional(),
      },
    },
    async ({ selector, tabId }) =>
      textResult(await bridge.call("interaction.click", { selector, tabId })),
  );

  server.registerTool(
    "fill",
    {
      description: "Fill an input or textarea by CSS selector.",
      inputSchema: {
        selector: z.string(),
        value: z.string(),
        tabId: z.number().int().optional(),
      },
    },
    async ({ selector, value, tabId }) =>
      textResult(await bridge.call("interaction.fill", { selector, value, tabId })),
  );

  server.registerTool(
    "press_key",
    {
      description: "Dispatch a key press to the active element in a tab.",
      inputSchema: {
        key: z.string(),
        tabId: z.number().int().optional(),
      },
    },
    async ({ key, tabId }) =>
      textResult(await bridge.call("interaction.press", { key, tabId })),
  );

  server.registerTool(
    "scroll",
    {
      description: "Scroll the page or bring an element into view.",
      inputSchema: {
        tabId: z.number().int().optional(),
        x: z.number().optional(),
        y: z.number().optional(),
        selector: z.string().optional(),
      },
    },
    async (params) => textResult(await bridge.call("interaction.scroll", params)),
  );

  server.registerTool(
    "hover",
    {
      description: "Hover an element by CSS selector.",
      inputSchema: {
        selector: z.string(),
        tabId: z.number().int().optional(),
      },
    },
    async ({ selector, tabId }) =>
      textResult(await bridge.call("interaction.hover", { selector, tabId })),
  );

  server.registerTool(
    "cdp_command",
    {
      description:
        "Send a raw Chrome DevTools Protocol command via chrome.debugger. Bypasses remote debugging port requirements.",
      inputSchema: {
        method: z.string(),
        params: z.record(z.string(), z.unknown()).optional(),
        tabId: z.number().int().optional(),
      },
    },
    async ({ method, params, tabId }) =>
      textResult(await bridge.call("debugger.sendCommand", { method, params, tabId })),
  );

  server.registerTool(
    "get_cookies",
    {
      description: "Read cookies for a URL.",
      inputSchema: {
        url: z.string().url(),
        name: z.string().optional(),
      },
    },
    async ({ url, name }) => textResult(await bridge.call("cookies.get", { url, name })),
  );

  server.registerTool(
    "set_cookie",
    {
      description: "Set a cookie for a URL.",
      inputSchema: {
        url: z.string().url(),
        name: z.string(),
        value: z.string(),
        domain: z.string().optional(),
        path: z.string().optional(),
        secure: z.boolean().optional(),
        httpOnly: z.boolean().optional(),
        sameSite: z.enum(["no_restriction", "lax", "strict"]).optional(),
        expirationDate: z.number().optional(),
      },
    },
    async (params) => textResult(await bridge.call("cookies.set", params)),
  );
}
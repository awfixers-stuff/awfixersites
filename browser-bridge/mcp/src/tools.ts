import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Logger } from "../../shared/logger";
import type { RemoteExtensionBridge } from "./bridge";

function textResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function withToolLogging<T extends Record<string, unknown>>(
  logger: Logger,
  toolName: string,
  handler: (args: T) => Promise<ReturnType<typeof textResult>>,
) {
  return async (args: T) => {
    const started = Date.now();
    logger.info("MCP tool invoked", { tool: toolName, args });
    try {
      const result = await handler(args);
      logger.info("MCP tool completed", { tool: toolName, durationMs: Date.now() - started });
      return result;
    } catch (error) {
      logger.error("MCP tool failed", {
        tool: toolName,
        durationMs: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };
}

export function registerBrowserTools(
  server: McpServer,
  bridge: RemoteExtensionBridge,
  logger: Logger,
) {
  const toolLog = logger.child("tool");

  server.registerTool(
    "bridge_status",
    {
      description: "Check MCP bridge and Chrome extension connection status.",
      inputSchema: {},
    },
    withToolLogging(toolLog, "bridge_status", async () => {
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
    }),
  );

  server.registerTool(
    "bridge_logs",
    {
      description:
        "Fetch recent structured logs from the WebSocket bridge (connections, auth, tool calls, extension events).",
      inputSchema: {
        limit: z.number().int().min(1).max(500).optional(),
        component: z.string().optional(),
      },
    },
    withToolLogging(toolLog, "bridge_logs", async ({ limit, component }) => {
      const [bridgeLogs, extensionLogs] = await Promise.all([
        bridge.getLogs(limit ?? 100, component).catch((error) => ({
          error: error instanceof Error ? error.message : String(error),
        })),
        bridge.call("bridge.logs", { limit: limit ?? 50 }).catch((error) => ({
          error: error instanceof Error ? error.message : String(error),
        })),
      ]);
      return textResult({ bridge: bridgeLogs, extension: extensionLogs });
    }),
  );

  server.registerTool(
    "list_tabs",
    {
      description: "List Chrome tabs. Optionally filter with Chrome tabs.query fields.",
      inputSchema: {
        query: z.record(z.string(), z.unknown()).optional(),
      },
    },
    withToolLogging(toolLog, "list_tabs", async ({ query }) =>
      textResult(await bridge.call("tabs.list", { query })),
    ),
  );

  server.registerTool(
    "get_tab",
    {
      description: "Get metadata for a tab. Uses active tab when tabId is omitted.",
      inputSchema: {
        tabId: z.number().int().optional(),
      },
    },
    withToolLogging(toolLog, "get_tab", async ({ tabId }) =>
      textResult(await bridge.call("tabs.get", { tabId })),
    ),
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
    async ({ selector, tabId }) => textResult(await bridge.call("dom.query", { selector, tabId })),
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
      description:
        "Fill an input, textarea, or contenteditable element (e.g. TipTap/ProseMirror) by CSS selector.",
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
    async ({ key, tabId }) => textResult(await bridge.call("interaction.press", { key, tabId })),
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

  server.registerTool(
    "remove_cookie",
    {
      description: "Remove a cookie for a URL.",
      inputSchema: {
        url: z.string().url(),
        name: z.string(),
      },
    },
    withToolLogging(toolLog, "remove_cookie", async ({ url, name }) =>
      textResult(await bridge.call("cookies.remove", { url, name })),
    ),
  );

  server.registerTool(
    "read_clipboard",
    {
      description: "Read clipboard text via the page context.",
      inputSchema: {
        tabId: z.number().int().optional(),
      },
    },
    withToolLogging(toolLog, "read_clipboard", async ({ tabId }) =>
      textResult(await bridge.call("clipboard.read", { tabId })),
    ),
  );

  server.registerTool(
    "write_clipboard",
    {
      description: "Write text to the clipboard via the page context.",
      inputSchema: {
        text: z.string(),
        tabId: z.number().int().optional(),
      },
    },
    withToolLogging(toolLog, "write_clipboard", async ({ text, tabId }) =>
      textResult(await bridge.call("clipboard.write", { text, tabId })),
    ),
  );

  server.registerTool(
    "get_console_logs",
    {
      description: "Get buffered console logs from a tab's content script.",
      inputSchema: {
        tabId: z.number().int().optional(),
        limit: z.number().int().min(1).max(500).optional(),
      },
    },
    withToolLogging(toolLog, "get_console_logs", async (params) =>
      textResult(await bridge.call("console.get", params)),
    ),
  );

  server.registerTool(
    "batch_inspect",
    {
      description:
        "Batch snapshot of all tabs: page console logs, CDP network/console/log events, and optional accessibility trees.",
      inputSchema: {
        tabIds: z.array(z.number().int()).optional(),
        includeNetwork: z.boolean().optional(),
        includeConsole: z.boolean().optional(),
        includeAccessibility: z.boolean().optional(),
        limit: z.number().int().min(1).max(500).optional(),
      },
    },
    withToolLogging(toolLog, "batch_inspect", async (params) =>
      textResult(await bridge.call("observability.batch", params)),
    ),
  );

  server.registerTool(
    "manage_extension",
    {
      description:
        "Open chrome://extensions for this extension, optionally clear service worker errors, and reload the extension.",
      inputSchema: {
        clearErrors: z.boolean().optional(),
        reload: z.boolean().optional(),
        useUiReload: z.boolean().optional(),
      },
    },
    withToolLogging(toolLog, "manage_extension", async ({ clearErrors, reload, useUiReload }) => {
      const steps: Record<string, unknown>[] = [];

      const settings = await bridge.call("extension.openSettings");
      steps.push({ step: "openSettings", result: settings });

      if (clearErrors !== false) {
        const cleared = await bridge.call("extension.clearErrors");
        steps.push({ step: "clearErrors", result: cleared });
      }

      if (reload !== false) {
        if (useUiReload) {
          const uiReload = await bridge.call("extension.reloadFromUI");
          steps.push({ step: "reloadFromUI", result: uiReload });
        } else {
          const reloaded = await bridge.call("extension.reload");
          steps.push({ step: "reload", result: reloaded });
        }
      }

      return textResult({
        ok: true,
        note: "Extension reload disconnects MCP briefly; wait ~3s then call bridge_status.",
        steps,
      });
    }),
  );

  server.registerTool(
    "find_overlay",
    {
      description:
        "Find in-page overlay UI candidates (e.g. 1Password autofill menus) by text/keyword search with shadow-DOM piercing.",
      inputSchema: {
        tabId: z.number().int().optional(),
        text: z.string().optional(),
        keywords: z.array(z.string()).optional(),
      },
    },
    withToolLogging(toolLog, "find_overlay", async (params) =>
      textResult(await bridge.call("overlay.find", params)),
    ),
  );

  server.registerTool(
    "click_overlay",
    {
      description:
        "Click an in-page overlay element by CSS selector, text match, or screen coordinates.",
      inputSchema: {
        tabId: z.number().int().optional(),
        selector: z.string().optional(),
        text: z.string().optional(),
        x: z.number().optional(),
        y: z.number().optional(),
      },
    },
    withToolLogging(toolLog, "click_overlay", async (params) =>
      textResult(await bridge.call("overlay.click", params)),
    ),
  );
}

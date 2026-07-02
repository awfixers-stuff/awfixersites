import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { RemoteExtensionBridge } from "./bridge";
import { ensureExtensionBridge } from "./ensure-bridge";
import { createServerLogger } from "./log-setup";
import { registerBrowserTools } from "./tools";

const { logger } = createServerLogger("mcp", "BROWSER_BRIDGE_LOG_FILE", "browser-bridge-mcp.log");

logger.info("MCP server starting");

await ensureExtensionBridge(logger);

const bridge = new RemoteExtensionBridge({
  host: process.env.BROWSER_BRIDGE_HOST ?? "127.0.0.1",
  port: Number(process.env.BROWSER_BRIDGE_PORT ?? "18793"),
  logger: logger.child("remote"),
});

await bridge.refreshStatus();
logger.info("Bridge status on startup", { extensionConnected: bridge.isExtensionConnected });

const server = new McpServer({
  name: "awfixer-browser-bridge",
  version: "0.1.0",
});

registerBrowserTools(server, bridge, logger);

const transport = new StdioServerTransport();
await server.connect(transport);
logger.info("MCP server connected via stdio");
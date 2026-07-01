import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { RemoteExtensionBridge } from "./bridge";
import { registerBrowserTools } from "./tools";

const bridge = new RemoteExtensionBridge({
  host: process.env.BROWSER_BRIDGE_HOST ?? "127.0.0.1",
  port: Number(process.env.BROWSER_BRIDGE_PORT ?? "18793"),
});

await bridge.refreshStatus();

const server = new McpServer({
  name: "awfixer-browser-bridge",
  version: "0.1.0",
});

registerBrowserTools(server, bridge);

const transport = new StdioServerTransport();
await server.connect(transport);
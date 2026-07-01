import type { Server, ServerWebSocket } from "bun";
import type { BridgeRequest, BridgeResponse } from "../../shared/protocol";
import { DEFAULT_BRIDGE_HOST, DEFAULT_BRIDGE_PORT } from "../../shared/protocol";

type PendingRequest = {
  resolve: (value: BridgeResponse) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

export type ExtensionBridgeOptions = {
  host?: string;
  port?: number;
  token?: string;
  requestTimeoutMs?: number;
};

export class ExtensionBridge {
  private server: Server<unknown> | null = null;
  private extensionSocket: ServerWebSocket<unknown> | null = null;
  private readonly pending = new Map<string, PendingRequest>();
  private readonly host: string;
  private readonly port: number;
  private readonly token?: string;
  private readonly requestTimeoutMs: number;

  constructor(options: ExtensionBridgeOptions = {}) {
    this.host = options.host ?? DEFAULT_BRIDGE_HOST;
    this.port = options.port ?? DEFAULT_BRIDGE_PORT;
    this.token = options.token;
    this.requestTimeoutMs = options.requestTimeoutMs ?? 60_000;
  }

  get isExtensionConnected() {
    return this.extensionSocket !== null;
  }

  get url() {
    return `http://${this.host}:${this.port}`;
  }

  async start() {
    if (this.server) return;

    this.server = Bun.serve({
      hostname: this.host,
      port: this.port,
      fetch: async (req, server) => {
        const url = new URL(req.url);

        if (url.pathname === "/healthz") {
          return Response.json({
            ok: true,
            extensionConnected: this.isExtensionConnected,
          });
        }

        if (url.pathname === "/call" && req.method === "POST") {
          let body: { method?: string; params?: Record<string, unknown> };
          try {
            body = (await req.json()) as { method?: string; params?: Record<string, unknown> };
          } catch {
            return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
          }

          if (!body.method) {
            return Response.json({ ok: false, error: "method is required" }, { status: 400 });
          }

          try {
            const result = await this.call(body.method, body.params);
            return Response.json({ ok: true, result });
          } catch (error) {
            return Response.json(
              {
                ok: false,
                error: error instanceof Error ? error.message : String(error),
              },
              { status: 503 },
            );
          }
        }

        if (url.pathname === "/extension") {
          if (server.upgrade(req, { data: null })) return undefined;
          return new Response("Expected websocket", { status: 400 });
        }

        return new Response("Not found", { status: 404 });
      },
      websocket: {
        open: (ws) => {
          if (this.extensionSocket) {
            ws.close(1008, "Another extension is already connected");
            return;
          }
          this.extensionSocket = ws;
        },
        message: (ws, message) => {
          const text = typeof message === "string" ? message : new TextDecoder().decode(message);
          let parsed: unknown;
          try {
            parsed = JSON.parse(text);
          } catch {
            return;
          }

          if (
            typeof parsed === "object" &&
            parsed !== null &&
            "type" in parsed &&
            (parsed as { type: string }).type === "auth"
          ) {
            const token = (parsed as { token?: string }).token;
            if (this.token && token !== this.token) {
              ws.close(1008, "Invalid auth token");
            }
            return;
          }

          const response = parsed as BridgeResponse;
          if (!response?.id) return;
          const pending = this.pending.get(response.id);
          if (!pending) return;
          clearTimeout(pending.timer);
          this.pending.delete(response.id);
          pending.resolve(response);
        },
        close: () => {
          if (this.extensionSocket) this.extensionSocket = null;
          for (const [id, pending] of this.pending) {
            clearTimeout(pending.timer);
            pending.reject(new Error("Extension disconnected"));
            this.pending.delete(id);
          }
        },
      },
    });
  }

  async stop() {
    this.extensionSocket?.close();
    this.extensionSocket = null;
    await this.server?.stop();
    this.server = null;
  }

  async call(method: string, params?: Record<string, unknown>): Promise<unknown> {
    if (!this.extensionSocket) {
      throw new Error(
        "Chrome extension is not connected. Load browser-bridge/extension/dist unpacked in chrome://extensions.",
      );
    }

    const id = crypto.randomUUID();
    const request: BridgeRequest = { id, method, params };

    const response = await new Promise<BridgeResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Bridge request timed out: ${method}`));
      }, this.requestTimeoutMs);

      this.pending.set(id, { resolve, reject, timer });
      this.extensionSocket!.send(JSON.stringify(request));
    });

    if (!response.ok) {
      throw new Error(response.error ?? `Bridge request failed: ${method}`);
    }

    return response.result;
  }
}

export class RemoteExtensionBridge {
  private readonly baseUrl: string;
  private readonly requestTimeoutMs: number;
  private extensionConnected = false;

  constructor(options: ExtensionBridgeOptions = {}) {
    const host = options.host ?? DEFAULT_BRIDGE_HOST;
    const port = options.port ?? DEFAULT_BRIDGE_PORT;
    this.baseUrl = `http://${host}:${port}`;
    this.requestTimeoutMs = options.requestTimeoutMs ?? 60_000;
  }

  get isExtensionConnected() {
    return this.extensionConnected;
  }

  async refreshStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/healthz`, { signal: AbortSignal.timeout(2000) });
      const data = (await response.json()) as { extensionConnected?: boolean };
      this.extensionConnected = data.extensionConnected === true;
    } catch {
      this.extensionConnected = false;
    }
  }

  async call(method: string, params?: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/call`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ method, params }),
      signal: AbortSignal.timeout(this.requestTimeoutMs),
    });

    const data = (await response.json()) as { ok: boolean; result?: unknown; error?: string };
    if (!data.ok) {
      throw new Error(data.error ?? `Bridge request failed: ${method}`);
    }
    return data.result;
  }
}
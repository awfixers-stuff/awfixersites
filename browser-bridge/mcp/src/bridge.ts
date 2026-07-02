import type { Server, ServerWebSocket } from "bun";
import type { BridgeRequest, BridgeResponse } from "../../shared/protocol";
import { DEFAULT_BRIDGE_HOST, DEFAULT_BRIDGE_PORT } from "../../shared/protocol";
import type { LogEntry, Logger } from "../../shared/logger";
import { LogRingBuffer } from "../../shared/logger";

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
  logger?: Logger;
  logRing?: LogRingBuffer;
};

export class ExtensionBridge {
  private server: Server<unknown> | null = null;
  private extensionSocket: ServerWebSocket<unknown> | null = null;
  private readonly pending = new Map<string, PendingRequest>();
  private readonly host: string;
  private readonly port: number;
  private readonly token?: string;
  private readonly requestTimeoutMs: number;
  private readonly log: Logger;
  private readonly logRing: LogRingBuffer;

  constructor(options: ExtensionBridgeOptions = {}) {
    this.host = options.host ?? DEFAULT_BRIDGE_HOST;
    this.port = options.port ?? DEFAULT_BRIDGE_PORT;
    this.token = options.token;
    this.requestTimeoutMs = options.requestTimeoutMs ?? 60_000;
    this.log = options.logger ?? {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      child: () => this.log,
    };
    this.logRing = options.logRing ?? new LogRingBuffer();
  }

  get recentLogs() {
    return this.logRing;
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

        if (url.pathname === "/logs") {
          const limit = Number(url.searchParams.get("limit") ?? "100");
          const component = url.searchParams.get("component") ?? undefined;
          return Response.json({
            ok: true,
            logs: this.logRing.snapshot(
              Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 500) : 100,
              component ?? undefined,
            ),
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

          const started = Date.now();
          this.log.info("HTTP /call received", { method: body.method });

          try {
            const result = await this.call(body.method, body.params);
            this.log.info("HTTP /call completed", {
              method: body.method,
              durationMs: Date.now() - started,
            });
            return Response.json({ ok: true, result });
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.log.error("HTTP /call failed", {
              method: body.method,
              durationMs: Date.now() - started,
              error: message,
            });
            return Response.json({ ok: false, error: message }, { status: 503 });
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
            this.log.warn("Replacing stale extension connection");
            const stale = this.extensionSocket;
            this.extensionSocket = null;
            for (const [id, pending] of this.pending) {
              clearTimeout(pending.timer);
              pending.reject(new Error("Extension replaced by new connection"));
              this.pending.delete(id);
            }
            stale.close(1000, "Replaced by new connection");
          }
          this.extensionSocket = ws;
          this.log.info("Extension WebSocket connected");
        },
        message: (ws, message) => {
          const text = typeof message === "string" ? message : new TextDecoder().decode(message);
          let parsed: unknown;
          try {
            parsed = JSON.parse(text);
          } catch {
            this.log.warn("Received non-JSON WebSocket message");
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
              this.log.warn("Extension auth failed — token mismatch");
              ws.close(1008, "Invalid auth token");
              return;
            }
            this.log.info("Extension authenticated", { tokenConfigured: Boolean(this.token) });
            return;
          }

          if (
            typeof parsed === "object" &&
            parsed !== null &&
            "type" in parsed &&
            (parsed as { type: string }).type === "event" &&
            "event" in parsed &&
            (parsed as { event: string }).event === "log"
          ) {
            const data = (parsed as { data?: LogEntry }).data;
            if (data?.msg) {
              this.logRing.push({
                ts: data.ts ?? new Date().toISOString(),
                level: data.level ?? "info",
                component: data.component ?? "extension",
                msg: data.msg,
                data: data.data,
              });
            }
            return;
          }

          const response = parsed as BridgeResponse;
          if (!response?.id) return;
          const pending = this.pending.get(response.id);
          if (!pending) {
            this.log.debug("Received response for unknown request", { id: response.id });
            return;
          }
          clearTimeout(pending.timer);
          this.pending.delete(response.id);
          if (!response.ok) {
            this.log.warn("Extension returned error", {
              id: response.id,
              error: response.error,
            });
          }
          pending.resolve(response);
        },
        close: (ws, code, reason) => {
          if (this.extensionSocket === ws) {
            this.extensionSocket = null;
          }
          const pendingCount = this.pending.size;
          this.log.warn("Extension WebSocket disconnected", {
            code,
            reason: reason || undefined,
            pendingRequests: pendingCount,
          });
          for (const [id, pending] of this.pending) {
            clearTimeout(pending.timer);
            pending.reject(new Error("Extension disconnected"));
            this.pending.delete(id);
          }
        },
      },
    });

    this.log.info("Bridge server started", { host: this.host, port: this.port });
  }

  async stop() {
    this.extensionSocket?.close();
    this.extensionSocket = null;
    await this.server?.stop();
    this.server = null;
  }

  async call(method: string, params?: Record<string, unknown>): Promise<unknown> {
    if (!this.extensionSocket) {
      this.log.error("Bridge call rejected — extension not connected", { method });
      throw new Error(
        "Chrome extension is not connected. Load browser-bridge/extension/dist unpacked in chrome://extensions.",
      );
    }

    const id = crypto.randomUUID();
    const request: BridgeRequest = { id, method, params };
    const started = Date.now();
    this.log.debug("Forwarding request to extension", { id, method });

    const response = await new Promise<BridgeResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        this.log.error("Bridge request timed out", {
          id,
          method,
          timeoutMs: this.requestTimeoutMs,
        });
        reject(new Error(`Bridge request timed out: ${method}`));
      }, this.requestTimeoutMs);

      this.pending.set(id, { resolve, reject, timer });
      this.extensionSocket!.send(JSON.stringify(request));
    });

    if (!response.ok) {
      this.log.warn("Bridge request failed", {
        id,
        method,
        durationMs: Date.now() - started,
        error: response.error,
      });
      throw new Error(response.error ?? `Bridge request failed: ${method}`);
    }

    this.log.debug("Bridge request succeeded", {
      id,
      method,
      durationMs: Date.now() - started,
    });
    return response.result;
  }
}

export class RemoteExtensionBridge {
  private readonly baseUrl: string;
  private readonly requestTimeoutMs: number;
  private readonly log: Logger;
  private extensionConnected = false;

  constructor(options: ExtensionBridgeOptions = {}) {
    const host = options.host ?? DEFAULT_BRIDGE_HOST;
    const port = options.port ?? DEFAULT_BRIDGE_PORT;
    this.baseUrl = `http://${host}:${port}`;
    this.requestTimeoutMs = options.requestTimeoutMs ?? 60_000;
    this.log = options.logger ?? {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {},
      child: () => this.log,
    };
  }

  get isExtensionConnected() {
    return this.extensionConnected;
  }

  async refreshStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/healthz`, {
        signal: AbortSignal.timeout(2000),
      });
      const data = (await response.json()) as { extensionConnected?: boolean };
      const wasConnected = this.extensionConnected;
      this.extensionConnected = data.extensionConnected === true;
      if (wasConnected !== this.extensionConnected) {
        this.log.info("Extension connection status changed", {
          extensionConnected: this.extensionConnected,
        });
      }
    } catch (error) {
      this.extensionConnected = false;
      this.log.warn("Bridge health check failed", {
        url: `${this.baseUrl}/healthz`,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getLogs(limit = 100, component?: string): Promise<unknown> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (component) params.set("component", component);
    const response = await fetch(`${this.baseUrl}/logs?${params}`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = (await response.json()) as { ok: boolean; logs?: unknown; error?: string };
    if (!data.ok) {
      throw new Error(data.error ?? "Failed to fetch bridge logs");
    }
    return data.logs;
  }

  async call(method: string, params?: Record<string, unknown>): Promise<unknown> {
    const started = Date.now();
    this.log.debug("Remote bridge call", { method });

    const response = await fetch(`${this.baseUrl}/call`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ method, params }),
      signal: AbortSignal.timeout(this.requestTimeoutMs),
    });

    const data = (await response.json()) as { ok: boolean; result?: unknown; error?: string };
    if (!data.ok) {
      this.log.warn("Remote bridge call failed", {
        method,
        durationMs: Date.now() - started,
        error: data.error,
      });
      throw new Error(data.error ?? `Bridge request failed: ${method}`);
    }

    this.log.debug("Remote bridge call succeeded", {
      method,
      durationMs: Date.now() - started,
    });
    return data.result;
  }
}

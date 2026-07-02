import type { BridgeMessage, BridgeRequest, BridgeResponse } from "../../shared/protocol";
import { DEFAULT_BRIDGE_HOST, DEFAULT_BRIDGE_PORT } from "../../shared/protocol";
import type { LogEntry } from "../../shared/logger";
import { handleBridgeRequest } from "./handlers";
import { logger, setLogForwarder } from "./logger";

type BridgeClientOptions = {
  host?: string;
  port?: number;
  token?: string;
  onStatus?: (status: "connecting" | "connected" | "disconnected") => void;
};

export class BridgeClient {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly host: string;
  private readonly port: number;
  private readonly token?: string;
  private readonly onStatus?: BridgeClientOptions["onStatus"];
  private reconnectAttempt = 0;

  constructor(options: BridgeClientOptions = {}) {
    this.host = options.host ?? DEFAULT_BRIDGE_HOST;
    this.port = options.port ?? DEFAULT_BRIDGE_PORT;
    this.token = options.token;
    this.onStatus = options.onStatus;
  }

  start() {
    this.connect();
  }

  stop() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    setLogForwarder(null);
    this.socket?.close();
    this.socket = null;
    logger.info("Bridge client stopped");
  }

  private connect() {
    this.onStatus?.("connecting");
    const url = `ws://${this.host}:${this.port}/extension`;
    this.reconnectAttempt += 1;
    logger.info("Connecting to bridge", {
      url,
      attempt: this.reconnectAttempt,
      hasToken: Boolean(this.token),
    });

    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.onStatus?.("connected");
      logger.info("WebSocket connected", { url });

      setLogForwarder((entry: LogEntry) => {
        if (this.socket?.readyState !== WebSocket.OPEN) return;
        this.socket.send(
          JSON.stringify({
            type: "event",
            event: "log",
            data: entry,
          }),
        );
      });

      if (this.token) {
        this.socket?.send(JSON.stringify({ type: "auth", token: this.token }));
        logger.debug("Auth message sent");
      }
    };

    this.socket.onmessage = (event) => {
      void this.onMessage(event.data);
    };

    this.socket.onclose = (event) => {
      setLogForwarder(null);
      this.onStatus?.("disconnected");
      logger.warn("WebSocket disconnected", {
        code: event.code,
        reason: event.reason || undefined,
        wasClean: event.wasClean,
      });
      if (event.code === 1000 && event.reason === "Replaced by new connection") {
        logger.info("Not reconnecting — another extension client took over");
        return;
      }
      this.scheduleReconnect();
    };

    this.socket.onerror = () => {
      logger.error("WebSocket error", { url });
      this.socket?.close();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    const delayMs = Math.min(2000 * Math.max(this.reconnectAttempt, 1), 30_000);
    logger.info("Scheduling reconnect", { delayMs });
    this.reconnectTimer = setTimeout(() => this.connect(), delayMs);
  }

  private async onMessage(raw: string | ArrayBuffer | Blob) {
    if (typeof raw !== "string") return;
    let message: BridgeMessage;
    try {
      message = JSON.parse(raw) as BridgeMessage;
    } catch {
      logger.warn("Received non-JSON message from bridge");
      return;
    }

    if (!("id" in message) || !("method" in message)) return;

    const request = message as BridgeRequest;
    const started = Date.now();
    logger.debug("Handling bridge request", { id: request.id, method: request.method });

    let response: BridgeResponse;

    try {
      const result = await handleBridgeRequest(request);
      response = { id: request.id, ok: true, result };
      logger.debug("Bridge request handled", {
        id: request.id,
        method: request.method,
        durationMs: Date.now() - started,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Bridge request failed", {
        id: request.id,
        method: request.method,
        durationMs: Date.now() - started,
        error: errorMessage,
      });
      response = {
        id: request.id,
        ok: false,
        error: errorMessage,
      };
    }

    this.socket?.send(JSON.stringify(response));
  }
}
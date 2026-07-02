import type { BridgeMessage, BridgeRequest, BridgeResponse } from "../../shared/protocol";
import { DEFAULT_BRIDGE_HOST, DEFAULT_BRIDGE_PORT } from "../../shared/protocol";
import { handleBridgeRequest } from "./handlers";

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
    this.socket?.close();
    this.socket = null;
  }

  private connect() {
    this.onStatus?.("connecting");
    const url = `ws://${this.host}:${this.port}/extension`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.onStatus?.("connected");
      if (this.token) {
        this.socket?.send(JSON.stringify({ type: "auth", token: this.token }));
      }
    };

    this.socket.onmessage = (event) => {
      void this.onMessage(event.data);
    };

    this.socket.onclose = () => {
      this.onStatus?.("disconnected");
      this.scheduleReconnect();
    };

    this.socket.onerror = () => {
      this.socket?.close();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => this.connect(), 2000);
  }

  private async onMessage(raw: string | ArrayBuffer | Blob) {
    if (typeof raw !== "string") return;
    let message: BridgeMessage;
    try {
      message = JSON.parse(raw) as BridgeMessage;
    } catch {
      return;
    }

    if (!("id" in message) || !("method" in message)) return;

    const request = message as BridgeRequest;
    let response: BridgeResponse;

    try {
      const result = await handleBridgeRequest(request);
      response = { id: request.id, ok: true, result };
    } catch (error) {
      response = {
        id: request.id,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    this.socket?.send(JSON.stringify(response));
  }
}

import { logger } from "./logger";

export type CdpEventType = "console" | "network" | "log";

export type CdpBufferedEvent = {
  type: CdpEventType;
  method: string;
  timestamp: number;
  data: unknown;
};

const MAX_EVENTS_PER_TAB = 500;

const sessions = new Map<number, { domains: Set<string>; attachedByUs: boolean }>();
const eventBuffers = new Map<number, CdpBufferedEvent[]>();
const debuggerAttached = new Set<number>();

let listenerRegistered = false;

function getBuffer(tabId: number): CdpBufferedEvent[] {
  let buffer = eventBuffers.get(tabId);
  if (!buffer) {
    buffer = [];
    eventBuffers.set(tabId, buffer);
  }
  return buffer;
}

function pushEvent(tabId: number, type: CdpEventType, method: string, data: unknown) {
  const buffer = getBuffer(tabId);
  buffer.push({ type, method, timestamp: Date.now(), data });
  if (buffer.length > MAX_EVENTS_PER_TAB) {
    buffer.splice(0, buffer.length - MAX_EVENTS_PER_TAB);
  }
}

function classifyEvent(method: string): CdpEventType | null {
  if (method === "Runtime.consoleAPICalled") return "console";
  if (method.startsWith("Network.")) return "network";
  if (method === "Log.entryAdded") return "log";
  return null;
}

function ensureListener() {
  if (listenerRegistered) return;
  listenerRegistered = true;

  chrome.debugger.onEvent.addListener((source, method, params) => {
    const tabId = source.tabId;
    if (!tabId || !sessions.has(tabId)) return;
    const type = classifyEvent(method);
    if (type) pushEvent(tabId, type, method, params);
  });

  chrome.debugger.onDetach.addListener((source) => {
    if (source.tabId) {
      sessions.delete(source.tabId);
      debuggerAttached.delete(source.tabId);
    }
  });
}

async function attachDebugger(tabId: number): Promise<boolean> {
  if (debuggerAttached.has(tabId)) return false;
  await chrome.debugger.attach({ tabId }, "1.3");
  debuggerAttached.add(tabId);
  return true;
}

async function sendCommand(
  tabId: number,
  method: string,
  params?: Record<string, unknown>,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    chrome.debugger.sendCommand({ tabId }, method, params ?? {}, (result) => {
      const err = chrome.runtime.lastError;
      if (err) reject(new Error(err.message));
      else resolve(result);
    });
  });
}

export function isCdpSessionActive(tabId: number): boolean {
  return sessions.has(tabId);
}

export async function enableCdpSession(
  tabId: number,
  domains: string[] = ["Runtime", "Network", "Log"],
): Promise<{ enabled: boolean; domains: string[] }> {
  ensureListener();
  const attachedByUs = await attachDebugger(tabId);
  const domainSet = new Set(domains);

  for (const domain of domainSet) {
    if (domain === "Runtime") await sendCommand(tabId, "Runtime.enable");
    else if (domain === "Network") await sendCommand(tabId, "Network.enable");
    else if (domain === "Log") await sendCommand(tabId, "Log.enable");
  }

  sessions.set(tabId, { domains: domainSet, attachedByUs });
  logger.debug("CDP session enabled", { tabId, domains: [...domainSet] });
  return { enabled: true, domains: [...domainSet] };
}

export function getCdpEvents(
  tabId: number,
  options: { types?: CdpEventType[]; limit?: number; since?: number } = {},
): CdpBufferedEvent[] {
  let events = getBuffer(tabId);
  if (options.types?.length) {
    const allowed = new Set(options.types);
    events = events.filter((e) => allowed.has(e.type));
  }
  if (options.since) {
    events = events.filter((e) => e.timestamp >= options.since!);
  }
  const limit = options.limit ?? 100;
  return events.slice(-limit);
}

export async function disableCdpSession(tabId: number): Promise<{ disabled: boolean }> {
  sessions.delete(tabId);
  eventBuffers.delete(tabId);
  if (debuggerAttached.has(tabId)) {
    try {
      await chrome.debugger.detach({ tabId });
    } catch {
      // Tab may already be gone.
    }
    debuggerAttached.delete(tabId);
  }
  return { disabled: true };
}

export async function sendCdpCommand(
  tabId: number,
  method: string,
  params?: Record<string, unknown>,
): Promise<unknown> {
  if (!debuggerAttached.has(tabId)) await attachDebugger(tabId);
  return sendCommand(tabId, method, params);
}

export function getCdpAttachedTabs(): number[] {
  return [...debuggerAttached];
}

export function markDebuggerAttached(tabId: number) {
  debuggerAttached.add(tabId);
}

export function markDebuggerDetached(tabId: number) {
  debuggerAttached.delete(tabId);
  sessions.delete(tabId);
}
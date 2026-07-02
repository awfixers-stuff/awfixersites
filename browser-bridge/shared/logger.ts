export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  ts: string;
  level: LogLevel;
  component: string;
  msg: string;
  data?: Record<string, unknown>;
};

export type Logger = {
  debug: (msg: string, data?: Record<string, unknown>) => void;
  info: (msg: string, data?: Record<string, unknown>) => void;
  warn: (msg: string, data?: Record<string, unknown>) => void;
  error: (msg: string, data?: Record<string, unknown>) => void;
  child: (component: string) => Logger;
};

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export function parseLogLevel(value: string | undefined, fallback: LogLevel = "info"): LogLevel {
  const normalized = value?.trim().toLowerCase();
  if (normalized && normalized in LEVEL_ORDER) return normalized as LogLevel;
  return fallback;
}

export function formatLogLine(entry: LogEntry): string {
  const data =
    entry.data && Object.keys(entry.data).length > 0 ? ` ${JSON.stringify(entry.data)}` : "";
  return `[${entry.ts}] [${entry.level}] [${entry.component}] ${entry.msg}${data}`;
}

export function createLogger(options: {
  component: string;
  minLevel?: LogLevel;
  sinks?: Array<(entry: LogEntry) => void>;
}): Logger {
  const minLevel = options.minLevel ?? "info";
  const sinks = options.sinks ?? [defaultConsoleSink];

  function log(level: LogLevel, msg: string, data?: Record<string, unknown>) {
    if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) return;

    const entry: LogEntry = {
      ts: new Date().toISOString(),
      level,
      component: options.component,
      msg,
      ...(data && Object.keys(data).length > 0 ? { data } : {}),
    };

    for (const sink of sinks) {
      try {
        sink(entry);
      } catch {
        // Never let logging failures break the bridge.
      }
    }
  }

  return {
    debug: (msg, data) => log("debug", msg, data),
    info: (msg, data) => log("info", msg, data),
    warn: (msg, data) => log("warn", msg, data),
    error: (msg, data) => log("error", msg, data),
    child: (component) =>
      createLogger({
        component: `${options.component}:${component}`,
        minLevel,
        sinks,
      }),
  };
}

function defaultConsoleSink(entry: LogEntry) {
  const line = formatLogLine(entry);
  switch (entry.level) {
    case "debug":
    case "info":
      console.error(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "error":
      console.error(line);
      break;
  }
}

export class LogRingBuffer {
  private readonly entries: LogEntry[] = [];

  constructor(private readonly maxSize = 500) {}

  push(entry: LogEntry) {
    this.entries.push(entry);
    if (this.entries.length > this.maxSize) {
      this.entries.splice(0, this.entries.length - this.maxSize);
    }
  }

  snapshot(limit = 100, component?: string): LogEntry[] {
    const filtered = component
      ? this.entries.filter((entry) => entry.component.startsWith(component))
      : this.entries;
    return filtered.slice(-limit);
  }

  clear() {
    this.entries.length = 0;
  }
}
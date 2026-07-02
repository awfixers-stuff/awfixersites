import {
  createLogger,
  formatLogLine,
  parseLogLevel,
  type LogEntry,
  type Logger,
} from "../../shared/logger";

const localBuffer: LogEntry[] = [];
const MAX_LOCAL_BUFFER = 200;

let forwardLog: ((entry: LogEntry) => void) | null = null;

export function setLogForwarder(forward: ((entry: LogEntry) => void) | null) {
  forwardLog = forward;
}

function localBufferSink(entry: LogEntry) {
  localBuffer.push(entry);
  if (localBuffer.length > MAX_LOCAL_BUFFER) {
    localBuffer.splice(0, localBuffer.length - MAX_LOCAL_BUFFER);
  }
}

function forwardSink(entry: LogEntry) {
  forwardLog?.(entry);
}

function consoleSink(entry: LogEntry) {
  const line = formatLogLine(entry);
  switch (entry.level) {
    case "warn":
      console.warn(line);
      break;
    case "error":
      console.error(line);
      break;
    default:
      console.log(line);
      break;
  }
}

export const logger: Logger = createLogger({
  component: "extension",
  minLevel: parseLogLevel(undefined, "info"),
  sinks: [consoleSink, localBufferSink, forwardSink],
});

export function getRecentLogs(limit = 50): LogEntry[] {
  return localBuffer.slice(-limit);
}
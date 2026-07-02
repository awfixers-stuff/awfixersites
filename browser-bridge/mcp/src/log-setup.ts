import { appendFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import {
  createLogger,
  formatLogLine,
  LogRingBuffer,
  parseLogLevel,
  type LogEntry,
  type Logger,
} from "../../shared/logger";

const globalRing = new LogRingBuffer(1000);

function resolveLogFile(envVar: string, fallbackName: string): string {
  const logFile = process.env[envVar] ?? join(homedir(), ".grok/logs", fallbackName);
  mkdirSync(dirname(logFile), { recursive: true });
  return logFile;
}

function createFileSink(logFile: string) {
  return (entry: LogEntry) => {
    appendFileSync(logFile, `${JSON.stringify(entry)}\n`);
  };
}

function createRingSink(ring: LogRingBuffer) {
  return (entry: LogEntry) => {
    ring.push(entry);
  };
}

function createStderrSink() {
  return (entry: LogEntry) => {
    console.error(formatLogLine(entry));
  };
}

export type ServerLoggerBundle = {
  logger: Logger;
  ring: LogRingBuffer;
  logFile: string;
};

export function createServerLogger(component: string, logFileEnvVar: string, logFileName: string): ServerLoggerBundle {
  const minLevel = parseLogLevel(process.env.BROWSER_BRIDGE_LOG_LEVEL, "info");
  const logFile = resolveLogFile(logFileEnvVar, logFileName);
  const ring = globalRing;

  const logger = createLogger({
    component,
    minLevel,
    sinks: [createStderrSink(), createFileSink(logFile), createRingSink(ring)],
  });

  return { logger, ring, logFile };
}

export function getGlobalLogRing(): LogRingBuffer {
  return globalRing;
}
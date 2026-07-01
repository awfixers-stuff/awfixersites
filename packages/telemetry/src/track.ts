import { getActiveProviders } from "./providers/registry";

function safeCall(fn: () => void, providerName: string, method: string): void {
  try {
    fn();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[telemetry] ${providerName}.${method} failed`, error);
    }
  }
}

export function track(event: string, properties?: Record<string, unknown>): void {
  for (const provider of getActiveProviders()) {
    if (!provider.track) continue;
    safeCall(() => provider.track?.(event, properties), provider.name, "track");
  }
}

export function identify(distinctId: string, traits?: Record<string, unknown>): void {
  for (const provider of getActiveProviders()) {
    if (!provider.identify) continue;
    safeCall(() => provider.identify?.(distinctId, traits), provider.name, "identify");
  }
}

export function pageview(url?: string): void {
  const target = url ?? (typeof window !== "undefined" ? window.location.href : "");
  for (const provider of getActiveProviders()) {
    if (!provider.pageview) continue;
    safeCall(() => provider.pageview?.(target), provider.name, "pageview");
  }
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  for (const provider of getActiveProviders()) {
    if (!provider.captureError) continue;
    safeCall(() => provider.captureError?.(error, context), provider.name, "captureError");
  }
}

export function getDistinctId(): string | undefined {
  for (const provider of getActiveProviders()) {
    try {
      const id = provider.getDistinctId?.();
      if (id) return id;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error(`[telemetry] ${provider.name}.getDistinctId failed`, error);
      }
    }
  }
  return undefined;
}

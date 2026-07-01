import type { TelemetryProvider } from "./types";

const registered: TelemetryProvider[] = [];

export function registerProvider(provider: TelemetryProvider): void {
  if (registered.some((existing) => existing.name === provider.name)) return;
  registered.push(provider);
}

export function getActiveProviders(): TelemetryProvider[] {
  return registered;
}

export function resetProviders(): void {
  registered.length = 0;
}

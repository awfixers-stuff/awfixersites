import { onRequestErrorTelemetry, registerServerTelemetry } from "@awfixersites/telemetry/register-server";

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    registerServerTelemetry({ app: "account" });
  }
}

export const onRequestError = onRequestErrorTelemetry;

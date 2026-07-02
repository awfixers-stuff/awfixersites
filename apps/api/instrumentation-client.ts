import { registerApiBotId } from "@awfixersites/auth/botid-client";
import { registerAppTelemetry } from "@awfixersites/telemetry/register";

registerApiBotId();
registerAppTelemetry({ app: "api" });
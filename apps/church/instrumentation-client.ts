import { registerAppTelemetry } from "@awfixersites/telemetry/register";
import { registerAppBotId } from "@awfixersites/auth/botid-client";

registerAppBotId();
registerAppTelemetry({ app: "church" });

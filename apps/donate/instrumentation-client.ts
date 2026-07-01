import { registerAppTelemetry } from "@awfixersites/telemetry/register";
import { registerAppBotId } from "@awfixersites/auth/botid-client";
import { BOTID_DONATE_ROUTES } from "@awfixersites/auth/botid-protect";

registerAppBotId(BOTID_DONATE_ROUTES);
registerAppTelemetry({ app: "donate" });

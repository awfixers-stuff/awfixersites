import { registerAppTelemetry } from "@awfixersites/telemetry/register";
import { registerAppBotId } from "@awfixersites/auth/botid-client";
import { BOTID_TIPS_ROUTES } from "@awfixersites/auth/botid-protect";

registerAppBotId(BOTID_TIPS_ROUTES);
registerAppTelemetry({ app: "tips" });

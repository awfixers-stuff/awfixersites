import { registerAppTelemetry } from "@awfixersites/telemetry/register";
import { registerAppBotId } from "@awfixersites/auth/botid-client";
import { BOTID_ARMY_ROUTES } from "@awfixersites/auth/botid-protect";

registerAppBotId(BOTID_ARMY_ROUTES);
registerAppTelemetry({ app: "army" });

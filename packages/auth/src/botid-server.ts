import { checkBotId } from "botid/server";

export type BotIdGateOptions = {
  /** When true, allow verified crawlers (e.g. search) through. Default true. */
  allowVerifiedBots?: boolean;
  checkLevel?: "deepAnalysis" | "basic";
};

/**
 * Runs Vercel BotID server verification. In local dev, `checkBotId()` treats traffic as human unless
 * `developmentOptions.bypass` is set (see Vercel BotID local development docs).
 */
export async function rejectBotUnlessHuman(
  options: BotIdGateOptions = {},
): Promise<Response | null> {
  const { allowVerifiedBots = true, checkLevel = "deepAnalysis" } = options;

  const verification = await checkBotId({
    advancedOptions: { checkLevel },
  });

  if (verification.isHuman) {
    return null;
  }

  if (allowVerifiedBots && verification.isVerifiedBot) {
    return null;
  }

  if (verification.bypassed) {
    return null;
  }

  return Response.json(
    { error: "Automated traffic is not allowed on this endpoint." },
    { status: 403 },
  );
}

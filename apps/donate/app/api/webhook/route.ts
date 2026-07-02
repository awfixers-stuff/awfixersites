import { handleDonateWebhook } from "@awfixersites/api-handlers/donate/webhook";

/** Stripe server webhooks — no browser BotID challenge; verified via stripe-signature only. */
export async function POST(request: Request) {
  return handleDonateWebhook(request);
}
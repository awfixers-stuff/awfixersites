import { handleDonateWebhook } from "@awfixersites/api-handlers/donate/webhook";

export async function POST(request: Request) {
  return handleDonateWebhook(request);
}
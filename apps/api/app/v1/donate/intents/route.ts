import { rejectBotUnlessHuman } from "@awfixersites/auth/botid-server";
import { handleCreatePaymentIntent } from "@awfixersites/api-handlers/donate/create-intent";

export async function POST(request: Request) {
  const blocked = await rejectBotUnlessHuman();
  if (blocked) {
    return blocked;
  }

  return handleCreatePaymentIntent(request);
}
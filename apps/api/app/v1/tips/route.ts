import { rejectBotUnlessHuman } from "@awfixersites/auth/botid-server";
import { handleSubmitTip } from "@awfixersites/api-handlers/tips";

export async function POST(request: Request) {
  const blocked = await rejectBotUnlessHuman();
  if (blocked) {
    return blocked;
  }

  return handleSubmitTip(request);
}
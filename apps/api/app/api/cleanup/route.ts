import { handleCleanup } from "@awfixersites/api-handlers/cleanup";

export async function GET() {
  return handleCleanup();
}
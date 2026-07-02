import { getServerSession } from "@awfixersites/auth/server-session";
import { submitEnlistment, type SubmitEnlistmentArgs } from "@awfixersites/db/enlistments";

export async function handleSubmitEnlistment(request: Request): Promise<Response> {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return Response.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = (await request.json()) as Pick<SubmitEnlistmentArgs, "enlistment">;
    if (!body?.enlistment || typeof body.enlistment !== "object") {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }

    const result = await submitEnlistment({
      enlistment: body.enlistment,
      idpUserId: session.user.id,
    });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit enlistment.";
    return Response.json({ error: message }, { status: 400 });
  }
}
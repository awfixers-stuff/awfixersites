import { headers } from "next/headers";

import { getAccountSetupForUser } from "./account-setup.server";
import { getAuth } from "./server";

export async function getServerSession() {
  const auth = getAuth();
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getAuthenticatedSession() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return null;
  }

  const setup = await getAccountSetupForUser(session.user.id, session.user);
  if (!setup.complete) {
    return null;
  }

  return session;
}

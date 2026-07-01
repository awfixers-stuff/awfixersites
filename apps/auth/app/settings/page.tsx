import { redirect } from "next/navigation";

import { getAccountSetupForUser } from "@awfixersites/auth/account-setup.server";
import { getServerSession } from "@awfixersites/auth/server-session";

import { SettingsPanel } from "./settings-panel";

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    redirect("/");
  }

  const setup = await getAccountSetupForUser(session.user.id, session.user);
  if (setup.redirect) {
    redirect(setup.redirect);
  }

  return <SettingsPanel />;
}

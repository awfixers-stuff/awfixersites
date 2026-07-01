import { redirect } from "next/navigation";

import { isAdminSession } from "@awfixersites/auth/admin/guard";
import { listOauthApplications } from "@awfixersites/auth/admin/oauth-clients";
import { getServerSession } from "@awfixersites/auth/server-session";

export const metadata = {
  title: "Admin — OAuth clients",
};

export default async function AdminOauthClientsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/sign-in?returnTo=/admin/oauth-clients");
  }
  if (!isAdminSession(session)) {
    redirect("/");
  }

  const { configured, registered } = await listOauthApplications();
  const registeredIds = new Set(registered.map((entry) => entry.clientId));

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <h1 className="font-display text-3xl tracking-tight">OAuth clients</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Configured satellite apps</h2>
        <div className="overflow-hidden rounded-xl border border-foreground/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-foreground/5 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Site</th>
                <th className="px-4 py-3">Client ID</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Redirect URLs</th>
              </tr>
            </thead>
            <tbody>
              {configured.map((client) => (
                <tr key={client.key} className="border-t border-foreground/10">
                  <td className="px-4 py-3 font-medium">{client.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{client.clientId}</td>
                  <td className="px-4 py-3">
                    {registeredIds.has(client.clientId) ? "Yes" : "Pending push"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {client.redirectUrls.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
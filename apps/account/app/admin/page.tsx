import { CLink as Link } from "@awfixersites/telemetry/link";
import { redirect } from "next/navigation";

import { isAdminSessionFresh } from "@awfixersites/auth/admin/guard";
import { listOauthApplications } from "@awfixersites/auth/admin/oauth-clients";
import { listUsersForAdmin } from "@awfixersites/auth/admin/users";
import { getServerSession } from "@awfixersites/auth/server-session";

export const metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/sign-in?returnTo=/admin");
  }
  if (!(await isAdminSessionFresh(session))) {
    redirect("/");
  }

  const [users, oauth] = await Promise.all([
    listUsersForAdmin({ limit: 10 }),
    listOauthApplications(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <div>
        <h1 className="font-display text-4xl tracking-tight">Admin dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Operator view for AWFixer identity. Changes apply to the IdP database.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent users</h2>
          <Link href="/admin/users" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-foreground/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-foreground/5 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">2FA</th>
                <th className="px-4 py-3">Passkeys</th>
                <th className="px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-foreground/10">
                  <td className="px-4 py-3 font-medium">
                    {user.username ?? user.displayUsername ?? user.id}
                  </td>
                  <td className="px-4 py-3">{user.twoFactorEnabled ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">{user._count.passkeys}</td>
                  <td className="px-4 py-3">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">OAuth clients</h2>
          <Link
            href="/admin/oauth-clients"
            className="text-sm font-medium text-primary hover:underline"
          >
            Manage
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          {oauth.configured.length} configured satellite clients, {oauth.registered.length}{" "}
          registered in the IdP database.
        </p>
      </section>
    </div>
  );
}

import { redirect } from "next/navigation";

import { isAdminSession } from "@awfixersites/auth/admin/guard";
import { listUsersForAdmin } from "@awfixersites/auth/admin/users";
import { getServerSession } from "@awfixersites/auth/server-session";

export const metadata = {
  title: "Admin — Users",
};

export default async function AdminUsersPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/sign-in?returnTo=/admin/users");
  }
  if (!isAdminSession(session)) {
    redirect("/");
  }

  const users = await listUsersForAdmin({ limit: 100 });

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-12">
      <h1 className="font-display text-3xl tracking-tight">Users</h1>
      <div className="overflow-hidden rounded-xl border border-foreground/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-foreground/5 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">2FA</th>
              <th className="px-4 py-3">Passkeys</th>
              <th className="px-4 py-3">Consents</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-foreground/10">
                <td className="px-4 py-3 font-medium">
                  {user.username ?? user.displayUsername ?? user.id}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{user.email}</td>
                <td className="px-4 py-3">{user.twoFactorEnabled ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{user._count.passkeys}</td>
                <td className="px-4 py-3">{user._count.oauthConsents}</td>
                <td className="px-4 py-3">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
"use client";

import { authClient } from "@awfixersites/auth/client";
import { Spinner } from "@awfixersites/ui/components/spinner";

export function AccountDashboard() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user as {
    username?: string;
    name?: string;
    email?: string;
    role?: string;
    twoFactorEnabled?: boolean;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl tracking-tight text-foreground">Your account</h1>
        <p className="mt-2 text-muted-foreground">
          Passkeys and TOTP are managed on the IdP. This dashboard shows your linked identity.
        </p>
      </div>

      <dl className="grid gap-4 rounded-xl border border-foreground/10 p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Username
          </dt>
          <dd className="mt-1 text-lg font-medium">{user.username ?? user.name ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Role
          </dt>
          <dd className="mt-1 text-lg font-medium">{user.role ?? "user"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Two-factor
          </dt>
          <dd className="mt-1 text-lg font-medium">
            {user.twoFactorEnabled ? "Enabled" : "Required — finish at auth.awfixer.me"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Internal email
          </dt>
          <dd className="mt-1 font-mono text-sm">{user.email ?? "—"}</dd>
        </div>
      </dl>

      <a
        href="https://auth.awfixer.me/settings?returnTo=https://account.awfixer.me"
        className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Open security settings on auth.awfixer.me
      </a>
    </div>
  );
}

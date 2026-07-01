"use client";

import * as React from "react";

import { authClient } from "@awfixersites/auth/client";
import { Button } from "@awfixersites/ui/components/button";
import { Spinner } from "@awfixersites/ui/components/spinner";

export function AccountSettings() {
  const { data: session, isPending } = authClient.useSession();
  const [signingOut, setSigningOut] = React.useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    window.location.assign("/");
  }

  if (isPending) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <p className="text-sm text-muted-foreground">
        You are not signed in.{" "}
        <a href="/" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </a>
      </p>
    );
  }

  const user = session.user as {
    username?: string;
    name?: string;
    twoFactorEnabled?: boolean;
    role?: string;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-foreground">Account settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage passkeys and two-factor authentication on the IdP.
        </p>
      </div>

      <dl className="grid gap-4 rounded-xl border border-foreground/10 p-6">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Username
          </dt>
          <dd className="mt-1 font-medium text-foreground">
            {user.username ?? user.name ?? "Unknown"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Two-factor
          </dt>
          <dd className="mt-1 font-medium text-foreground">
            {user.twoFactorEnabled ? "Enabled" : "Not enabled"}
          </dd>
        </div>
        {user.role === "admin" ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Role
            </dt>
            <dd className="mt-1 font-medium text-foreground">Administrator</dd>
          </div>
        ) : null}
      </dl>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={() => authClient.passkey.addPasskey()}>
          Add passkey
        </Button>
        <Button type="button" variant="outline" onClick={handleSignOut} disabled={signingOut}>
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </div>
  );
}
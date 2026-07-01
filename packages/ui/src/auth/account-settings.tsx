"use client";

import * as React from "react";

import { authClient } from "@awfixersites/auth/client";
import { Button } from "@awfixersites/ui/components/button";
import { Spinner } from "@awfixersites/ui/components/spinner";
import { cn } from "@awfixersites/ui/lib/utils";

type AccountSettingsProps = {
  embedded?: boolean;
  buttonClassName?: string;
  outlineButtonClassName?: string;
};

export function AccountSettings({
  embedded = false,
  buttonClassName,
  outlineButtonClassName,
}: AccountSettingsProps) {
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
      <p className="text-center text-base text-foreground/55">
        You are not signed in.{" "}
        <a href="/" className="font-medium text-foreground/80 underline-offset-4 hover:underline">
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
      {!embedded ? (
        <div>
          <h1 className="font-display text-3xl tracking-tight text-foreground">Account settings</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage passkeys and two-factor authentication on the IdP.
          </p>
        </div>
      ) : null}

      <dl className="grid gap-4 rounded-xl border border-foreground/10 bg-foreground/[0.03] p-6">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-widest text-foreground/45">
            Username
          </dt>
          <dd className="mt-1 font-medium text-foreground">
            {user.username ?? user.name ?? "Unknown"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-widest text-foreground/45">
            Two-factor
          </dt>
          <dd className="mt-1 font-medium text-foreground">
            {user.twoFactorEnabled ? "Enabled" : "Not enabled"}
          </dd>
        </div>
        {user.role === "admin" ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-foreground/45">
              Role
            </dt>
            <dd className="mt-1 font-medium text-foreground">Administrator</dd>
          </div>
        ) : null}
      </dl>

      <div className={cn("flex flex-col gap-3 sm:flex-row", embedded && "sm:justify-center")}>
        <Button
          type="button"
          variant="outline"
          className={outlineButtonClassName}
          onClick={() => authClient.passkey.addPasskey()}
        >
          Add passkey
        </Button>
        <Button
          type="button"
          className={buttonClassName}
          onClick={handleSignOut}
          disabled={signingOut}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";

import { Button } from "@awfixersites/ui/components/button";
import { authClient } from "@awfixersites/auth/client";

type AddPasskeyButtonProps = {
  name?: string;
  onSuccess?: () => void;
};

export function AddPasskeyButton({ name, onSuccess }: AddPasskeyButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const result = await authClient.passkey.addPasskey({ name });

    if (result.error) {
      setError(result.error.message ?? "Passkey registration failed.");
      setLoading(false);
      return;
    }

    onSuccess?.();
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" disabled={loading} onClick={handleClick}>
        {loading ? "Registering passkey..." : "Add passkey"}
      </Button>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

type SignInWithPasskeyButtonProps = {
  onSuccess?: () => void;
};

export function SignInWithPasskeyButton({ onSuccess }: SignInWithPasskeyButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    const result = await authClient.signIn.passkey();

    if (result.error) {
      setError(result.error.message ?? "Passkey sign in failed.");
      setLoading(false);
      return;
    }

    onSuccess?.();
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" disabled={loading} onClick={handleClick}>
        {loading ? "Signing in..." : "Sign in with passkey"}
      </Button>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  );
}

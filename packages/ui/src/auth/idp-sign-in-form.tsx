"use client";

import * as React from "react";

import { Button } from "@awfixersites/ui/components/button";
import { signInWithAwfixerIdp, redirectToIdpSignUp } from "@awfixersites/auth/oauth-login";

type IdpSignInFormProps = {
  returnTo?: string;
  onSuccess?: () => void;
};

export function IdpSignInForm({ returnTo, onSuccess }: IdpSignInFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const callbackURL = returnTo ?? "/";

  async function handleSignIn() {
    setLoading(true);
    setError(null);

    const result = await signInWithAwfixerIdp(callbackURL);

    if (result.error) {
      setError(result.error.message ?? "Sign-in failed.");
      setLoading(false);
      return;
    }

    onSuccess?.();
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="button" className="w-full" disabled={loading} onClick={handleSignIn}>
        {loading ? "Redirecting…" : "Sign in with AWFixer"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <button
          type="button"
          className="font-medium text-primary underline-offset-4 hover:underline"
          onClick={() => redirectToIdpSignUp(callbackURL)}
        >
          Create an account at auth.awfixer.me
        </button>
      </p>
    </div>
  );
}

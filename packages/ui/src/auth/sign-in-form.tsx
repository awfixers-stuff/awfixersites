"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@awfixersites/ui/components/button";
import { Input } from "@awfixersites/ui/components/input";
import { Label } from "@awfixersites/ui/components/label";
import { authClient, signInWithUsername } from "@awfixersites/auth/client";

type SignInFormProps = {
  onSuccess?: () => void;
  returnTo?: string;
};
export function SignInForm({ onSuccess, returnTo }: SignInFormProps) {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signInWithUsername({ username, password });

    if (result.error) {
      setError(result.error.message ?? "Sign in failed.");
      setLoading(false);
      return;
    }

    onSuccess?.();
    if (returnTo) {
      router.push(returnTo);
    } else {
      router.push("/");
    }
    router.refresh();
  }
  async function handlePasskey() {
    setLoading(true);
    setError(null);

    const result = await authClient.signIn.passkey();

    if (result.error) {
      setError(result.error.message ?? "Passkey sign in failed.");
      setLoading(false);
      return;
    }

    onSuccess?.();
    if (returnTo) {
      router.push(returnTo);
    } else {
      router.push("/");
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            placeholder="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            minLength={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </div>

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={loading}
        onClick={handlePasskey}
      >
        Sign in with passkey
      </Button>
    </div>
  );
}

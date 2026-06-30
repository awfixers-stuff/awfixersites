"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@awfixersites/ui/components/button";
import { Input } from "@awfixersites/ui/components/input";
import { Label } from "@awfixersites/ui/components/label";
import { registerPasskeyForUsername, signUpWithUsername } from "@awfixersites/auth/client";

type SignUpFormProps = {
  onSuccess?: () => void;
};

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const result = await signUpWithUsername({ username, password });

    if (result.error) {
      setError(result.error.message ?? "Sign up failed.");
      setLoading(false);
      return;
    }

    onSuccess?.();
    router.push("/");
    router.refresh();
  }

  async function handlePasskeySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError("Username is required to register a passkey.");
      return;
    }

    setLoading(true);

    const result = await registerPasskeyForUsername(username);

    if (result.error) {
      setError(result.error.message ?? "Passkey registration failed.");
      setLoading(false);
      return;
    }

    onSuccess?.();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            placeholder="username"
            value={username}
            onChange={(event) => setUsername(event.target.value.trim().toLowerCase())}
            required
            minLength={3}
            pattern="^[a-z0-9_][a-z0-9_-]*[a-z0-9_]$|^[a-z0-9_]$"
            title="3–32 lowercase letters, numbers, underscores, or hyphens"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
          />
        </div>

        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <form onSubmit={handlePasskeySubmit}>
        <Button type="submit" variant="outline" className="w-full" disabled={loading}>
          Create account with passkey
        </Button>
      </form>
    </div>
  );
}

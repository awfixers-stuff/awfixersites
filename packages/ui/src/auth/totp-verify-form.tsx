"use client";

import * as React from "react";

import { authClient } from "@awfixersites/auth/client";
import { Alert, AlertDescription, AlertTitle } from "@awfixersites/ui/components/alert";
import { Button } from "@awfixersites/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@awfixersites/ui/components/field";
import { Input } from "@awfixersites/ui/components/input";
import { Spinner } from "@awfixersites/ui/components/spinner";
import { cn } from "@awfixersites/ui/lib/utils";

type TotpVerifyFormProps = {
  onComplete?: () => void;
  embedded?: boolean;
  buttonClassName?: string;
};

export function TotpVerifyForm({
  onComplete,
  embedded = false,
  buttonClassName,
}: TotpVerifyFormProps) {
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim()) {
      setError("Enter your 6-digit authenticator code.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await authClient.twoFactor.verifyTotp({
      code: code.trim(),
      trustDevice: true,
    });

    if (result.error) {
      setError(result.error.message ?? "Invalid code. Try again.");
      setLoading(false);
      return;
    }

    onComplete?.();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-8">
        {!embedded ? (
          <div className="space-y-2 text-center">
            <h1 className="font-display text-3xl tracking-tight text-foreground">
              Verify authenticator
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter the code from your authenticator app to finish signing in.
            </p>
          </div>
        ) : null}

        <Field>
          <FieldLabel htmlFor="verify-totp-code" className={cn(embedded && "text-center block")}>
            Authenticator code
          </FieldLabel>
          <Input
            id="verify-totp-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
            className="h-12 rounded-lg border-foreground/10 bg-transparent px-4 text-lg"
          />
        </Field>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" className={buttonClassName ?? "w-full"} disabled={loading}>
          {loading ? (
            <>
              <Spinner className="size-4" />
              Verifying…
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}

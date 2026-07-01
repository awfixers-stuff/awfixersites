"use client";

import * as React from "react";

import { authClient } from "@awfixersites/auth/client";
import { Alert, AlertDescription, AlertTitle } from "@awfixersites/ui/components/alert";
import { Button } from "@awfixersites/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@awfixersites/ui/components/field";
import { Input } from "@awfixersites/ui/components/input";
import { Spinner } from "@awfixersites/ui/components/spinner";
import { cn } from "@awfixersites/ui/lib/utils";

type TotpSetupFormProps = {
  onComplete?: () => void;
  embedded?: boolean;
  buttonClassName?: string;
};

export function TotpSetupForm({
  onComplete,
  embedded = false,
  buttonClassName,
}: TotpSetupFormProps) {
  const [loading, setLoading] = React.useState(true);
  const [verifying, setVerifying] = React.useState(false);
  const [totpUri, setTotpUri] = React.useState<string | null>(null);
  const [backupCodes, setBackupCodes] = React.useState<string[]>([]);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function enableTotp() {
      const result = await authClient.twoFactor.enable({
        issuer: "AWFixer",
      });

      if (cancelled) return;

      if (result.error) {
        setError(result.error.message ?? "Failed to start TOTP setup.");
        setLoading(false);
        return;
      }

      setTotpUri(result.data?.totpURI ?? null);
      setBackupCodes(result.data?.backupCodes ?? []);
      setLoading(false);
    }

    void enableTotp();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim()) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setVerifying(true);
    setError(null);

    const result = await authClient.twoFactor.verifyTotp({
      code: code.trim(),
      trustDevice: true,
    });

    if (result.error) {
      setError(result.error.message ?? "Invalid code. Try again.");
      setVerifying(false);
      return;
    }

    onComplete?.();
    setVerifying(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify}>
      <FieldGroup className="gap-8">
        {!embedded ? (
          <div className="space-y-2 text-center">
            <h1 className="font-display text-3xl tracking-tight text-foreground">
              Set up authenticator
            </h1>
            <p className="text-sm text-muted-foreground">
              TOTP is required for every AWFixer account. Add this entry to your authenticator app,
              then enter the 6-digit code.
            </p>
          </div>
        ) : null}

        {totpUri ? (
          <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-foreground/45">
              Authenticator URI
            </p>
            <p className="break-all font-mono text-xs text-foreground">{totpUri}</p>
          </div>
        ) : null}

        {backupCodes.length > 0 ? (
          <div className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-foreground/45">
              Backup codes
            </p>
            <ul className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <Field>
          <FieldLabel htmlFor="totp-code" className={cn(embedded && "text-center block")}>
            Verification code
          </FieldLabel>
          <Input
            id="totp-code"
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

        <Button type="submit" className={buttonClassName ?? "w-full"} disabled={verifying}>
          {verifying ? (
            <>
              <Spinner className="size-4" />
              Verifying…
            </>
          ) : (
            "Verify and continue"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}

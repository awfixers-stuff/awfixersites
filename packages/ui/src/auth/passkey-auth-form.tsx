"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, GalleryVerticalEnd } from "lucide-react";

import { cn } from "@awfixersites/ui/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@awfixersites/ui/components/alert";
import { Button } from "@awfixersites/ui/components/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@awfixersites/ui/components/field";
import { Input } from "@awfixersites/ui/components/input";
import { Spinner } from "@awfixersites/ui/components/spinner";
import { authClient, registerPasskeyForUsername } from "@awfixersites/auth/client";

export type PasskeyAuthMode = "sign-in" | "sign-up";

type PasskeyAuthFormProps = React.ComponentProps<"div"> & {
  mode: PasskeyAuthMode;
  onModeChange: (mode: PasskeyAuthMode) => void;
  codesSiteUrl?: string;
  termsHref?: string;
  privacyHref?: string;
  onSuccess?: () => void;
  embedded?: boolean;
  buttonClassName?: string;
  showTerms?: boolean;
};

function getSubmitLabel(phase: "idle" | "loading", mode: PasskeyAuthMode): string {
  if (phase === "loading") {
    return mode === "sign-up" ? "Creating account…" : "Signing in…";
  }
  return mode === "sign-up" ? "Create your AWFixer Account" : "Sign in with your AWFixer Account";
}

export function PasskeyAuthForm({
  mode,
  onModeChange,
  codesSiteUrl = "https://awfixer.codes",
  termsHref = "https://awfixer.codes/terms",
  privacyHref = "https://awfixer.codes/privacy",
  onSuccess,
  embedded = false,
  buttonClassName,
  showTerms = true,
  className,
  ...props
}: PasskeyAuthFormProps) {
  const [username, setUsername] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isSignUp = mode === "sign-up";
  const submitLabel = getSubmitLabel(loading ? "loading" : "idle", mode);
  const useCtaButton = Boolean(buttonClassName);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;

    const trimmed = username.trim();
    if (!trimmed) {
      setError("Username is required.");
      return;
    }

    setLoading(true);
    setError(null);

    if (isSignUp) {
      const result = await registerPasskeyForUsername(trimmed, trimmed);
      if (result.error) {
        setError(result.error.message ?? "Passkey registration failed.");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("returnTo");
      const setupUrl = returnTo
        ? `/setup/totp?returnTo=${encodeURIComponent(returnTo)}`
        : "/setup/totp";
      window.location.assign(setupUrl);
      return;
    }

    const result = await authClient.signIn.passkey();
    if (result.error) {
      setError(result.error.message ?? "Passkey sign in failed.");
      setLoading(false);
      return;
    }

    const session = await authClient.getSession();
    const user = session.data?.user as { twoFactorEnabled?: boolean } | undefined;
    const params = new URLSearchParams(window.location.search);
    const returnTo = params.get("returnTo");

    if (!user?.twoFactorEnabled) {
      const setupUrl = returnTo
        ? `/setup/totp?returnTo=${encodeURIComponent(returnTo)}`
        : "/setup/totp";
      window.location.assign(setupUrl);
      return;
    }

    const verifyUrl = returnTo
      ? `/verify/totp?returnTo=${encodeURIComponent(returnTo)}`
      : "/verify/totp";
    window.location.assign(verifyUrl);
    setLoading(false);
  }

  return (
    <div className={cn(embedded ? "space-y-8" : "flex flex-col gap-10", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup className={embedded ? "gap-8" : "gap-8"}>
          {!embedded ? (
            <div className="flex flex-col items-center gap-5 text-center">
              <Link
                href={codesSiteUrl}
                className="group flex flex-col items-center gap-3 font-medium text-foreground/80 hover:text-foreground"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/5 transition-colors group-hover:bg-foreground/10">
                  <GalleryVerticalEnd className="size-8" />
                </div>
                <span className="sr-only">AWFixer Codes</span>
              </Link>
              <h1 className="font-display text-3xl tracking-tight text-foreground">
                {isSignUp ? "Create an account" : "Welcome back"}
              </h1>
            </div>
          ) : null}

          <FieldDescription
            className={cn(
              "text-base text-muted-foreground",
              embedded && "text-center text-foreground/55",
            )}
          >
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-base font-semibold text-foreground/80 hover:text-foreground"
                  onClick={() => onModeChange("sign-in")}
                >
                  Sign in
                </Button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-base font-semibold text-foreground/80 hover:text-foreground"
                  onClick={() => onModeChange("sign-up")}
                >
                  Sign up
                </Button>
              </>
            )}
          </FieldDescription>

          <div className={cn("flex flex-col", !embedded && "gap-5")}>
            <Field>
              <FieldLabel
                htmlFor="username"
                className={cn(
                  "text-base font-semibold text-foreground",
                  embedded && "text-center block",
                )}
              >
                Username
              </FieldLabel>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="awfixer"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12 rounded-lg border-foreground/10 bg-transparent px-4 text-lg placeholder:text-muted-foreground focus-visible:border-foreground/30 focus-visible:ring-foreground/20"
              />
            </Field>

            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Field style={embedded ? { marginTop: "0.5in" } : undefined}>
              <Button
                type="submit"
                size={useCtaButton ? undefined : "lg"}
                className={
                  buttonClassName ??
                  "group h-14 w-full rounded-full bg-foreground text-base text-background hover:bg-foreground/90"
                }
                disabled={loading || !username.trim()}
              >
                {loading ? (
                  <>
                    <Spinner className="size-6" />
                    {submitLabel}
                  </>
                ) : (
                  submitLabel
                )}
                {!useCtaButton && !loading ? (
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                ) : null}
              </Button>
            </Field>
          </div>
        </FieldGroup>
      </form>

      {showTerms ? (
        <FieldDescription
          className={cn(
            "px-6 text-center text-base text-muted-foreground",
            embedded && "px-0 text-sm text-foreground/45",
          )}
        >
          By clicking continue, you agree to our{" "}
          <a href={termsHref} className="font-semibold text-foreground/80 hover:text-foreground">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href={privacyHref} className="font-semibold text-foreground/80 hover:text-foreground">
            Privacy Policy
          </a>
          .
        </FieldDescription>
      ) : null}
    </div>
  );
}

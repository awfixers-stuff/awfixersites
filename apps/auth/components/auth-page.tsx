"use client";

import { Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { buildOidcAuthorizeResumeUrl, isOidcAuthorizeQuery } from "@awfixersites/auth/idp";
import { PasskeyAuthForm, type PasskeyAuthMode } from "@awfixersites/ui/auth";
import { Spinner } from "@awfixersites/ui/components/spinner";

import { ReferrerBackFooter } from "@/components/auth/referrer-back-footer";
import { AuthPanelLayout } from "@/components/auth/auth-panel-layout";
import { AuthShell } from "@/components/auth/auth-shell";
import { ctaButtonClassName } from "@/lib/cta-button";

const codesSiteUrl = process.env.NEXT_PUBLIC_CODES_SITE_URL ?? "https://awfixer.codes";
const termsHref = "https://awfixer.codes/terms";
const privacyHref = "https://awfixer.codes/privacy";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = useMemo<PasskeyAuthMode>(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "signup" || modeParam === "sign-up") return "sign-up";
    return "sign-in";
  }, [searchParams]);

  const setMode = useCallback(
    (next: PasskeyAuthMode) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("mode", next);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const returnTo = searchParams.get("returnTo") ?? undefined;
  const oidcAuthorize = isOidcAuthorizeQuery(searchParams);
  const isSignUp = mode === "sign-up";

  const handleSuccess = useCallback(() => {
    if (oidcAuthorize) {
      window.location.assign(buildOidcAuthorizeResumeUrl(searchParams));
      return;
    }

    const destination = returnTo ?? codesSiteUrl;
    window.location.assign(destination);
  }, [oidcAuthorize, returnTo, searchParams]);

  return (
    <AuthShell>
      <AuthPanelLayout
        eyebrow={isSignUp ? "Create account" : "Member access"}
        title={isSignUp ? "Join AWFixer" : "Welcome back"}
        description={
          isSignUp
            ? "Create your AWFixer account with a username and passkey. Two-factor authentication is required."
            : "Sign in with your AWFixer account to continue across the movement."
        }
        footer={
          <ReferrerBackFooter>
            <p className="max-w-md text-sm leading-relaxed text-foreground/50">
              By continuing, you agree to our{" "}
              <a href={termsHref} className="font-medium text-foreground/80 hover:text-foreground">
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href={privacyHref}
                className="font-medium text-foreground/80 hover:text-foreground"
              >
                Privacy Policy
              </a>
              .
            </p>
          </ReferrerBackFooter>
        }
      >
        <PasskeyAuthForm
          mode={mode}
          onModeChange={setMode}
          codesSiteUrl={codesSiteUrl}
          termsHref={termsHref}
          privacyHref={privacyHref}
          onSuccess={handleSuccess}
          embedded
          showTerms={false}
          buttonClassName={ctaButtonClassName("full")}
        />
      </AuthPanelLayout>
    </AuthShell>
  );
}

function AuthFallback() {
  return (
    <AuthShell>
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-8" />
      </div>
    </AuthShell>
  );
}

export function AuthPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthPageContent />
    </Suspense>
  );
}

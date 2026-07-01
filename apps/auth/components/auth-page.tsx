"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { buildOidcAuthorizeResumeUrl, isOidcAuthorizeQuery } from "@awfixersites/auth/idp";
import { PasskeyAuthForm, type PasskeyAuthMode } from "@awfixersites/ui/auth";
import { Spinner } from "@awfixersites/ui/components/spinner";

import { AuthChrome } from "@/components/auth-chrome";
import { CodesGridBackground } from "@/components/codes-grid-background";

const codesSiteUrl = process.env.NEXT_PUBLIC_CODES_SITE_URL ?? "https://awfixer.codes";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleSuccess = useCallback(() => {
    if (oidcAuthorize) {
      window.location.assign(buildOidcAuthorizeResumeUrl(searchParams));
      return;
    }

    const destination = returnTo ?? codesSiteUrl;
    window.location.assign(destination);
  }, [oidcAuthorize, returnTo, searchParams]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <AuthChrome />
      <CodesGridBackground />

      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-24 pt-28">
        <div
          className={`w-full max-w-lg transition-all duration-700 ease-out ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="rounded-2xl border border-foreground/10 bg-card p-10 text-card-foreground shadow-lg sm:p-12">
            <PasskeyAuthForm
              mode={mode}
              onModeChange={setMode}
              codesSiteUrl={codesSiteUrl}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Spinner className="size-8" />
    </div>
  );
}

export function AuthPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthPageContent />
    </Suspense>
  );
}

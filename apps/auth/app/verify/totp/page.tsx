"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { buildOidcAuthorizeResumeUrl, isOidcAuthorizeQuery } from "@awfixersites/auth/idp";
import { TotpVerifyForm } from "@awfixersites/ui/auth";
import { Spinner } from "@awfixersites/ui/components/spinner";

import { AuthChrome } from "@/components/auth-chrome";
import { CodesGridBackground } from "@/components/codes-grid-background";

const codesSiteUrl = process.env.NEXT_PUBLIC_CODES_SITE_URL ?? "https://awfixer.codes";

function TotpVerifyContent() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? undefined;
  const oidcAuthorize = isOidcAuthorizeQuery(searchParams);

  const handleComplete = useCallback(() => {
    if (oidcAuthorize) {
      window.location.assign(buildOidcAuthorizeResumeUrl(searchParams));
      return;
    }

    window.location.assign(returnTo ?? codesSiteUrl);
  }, [oidcAuthorize, returnTo, searchParams]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <AuthChrome />
      <CodesGridBackground />
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-24 pt-28">
        <div className="w-full max-w-lg rounded-2xl border border-foreground/10 bg-card p-10 text-card-foreground shadow-lg sm:p-12">
          <TotpVerifyForm onComplete={handleComplete} />
        </div>
      </div>
    </div>
  );
}

export default function TotpVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner className="size-8" />
        </div>
      }
    >
      <TotpVerifyContent />
    </Suspense>
  );
}
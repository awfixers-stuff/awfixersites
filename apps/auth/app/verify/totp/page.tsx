"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { buildOidcAuthorizeResumeUrl, isOidcAuthorizeQuery } from "@awfixersites/auth/idp";
import { resolveSafeReturnTo } from "@awfixersites/auth/referrer";
import { TotpVerifyForm } from "@awfixersites/ui/auth";
import { Spinner } from "@awfixersites/ui/components/spinner";

import { ReferrerBackFooter } from "@/components/auth/referrer-back-footer";
import { AuthPanelLayout } from "@/components/auth/auth-panel-layout";
import { AuthShell } from "@/components/auth/auth-shell";
import { ctaButtonClassName } from "@/lib/cta-button";

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

    window.location.assign(resolveSafeReturnTo(returnTo, codesSiteUrl));
  }, [oidcAuthorize, returnTo, searchParams]);

  return (
    <AuthShell>
      <AuthPanelLayout
        eyebrow="Security"
        title="Verify authenticator"
        description="Enter the code from your authenticator app to finish signing in."
        showFeatures={false}
        footer={<ReferrerBackFooter />}
      >
        <TotpVerifyForm
          onComplete={handleComplete}
          embedded
          buttonClassName={ctaButtonClassName("full")}
        />
      </AuthPanelLayout>
    </AuthShell>
  );
}

export default function TotpVerifyPage() {
  return (
    <Suspense
      fallback={
        <AuthShell>
          <div className="flex items-center justify-center py-24">
            <Spinner className="size-8" />
          </div>
        </AuthShell>
      }
    >
      <TotpVerifyContent />
    </Suspense>
  );
}

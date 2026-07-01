"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { buildOidcAuthorizeResumeUrl, isOidcAuthorizeQuery } from "@awfixersites/auth/idp";
import { TotpSetupForm } from "@awfixersites/ui/auth";
import { Spinner } from "@awfixersites/ui/components/spinner";

import { ReferrerBackFooter } from "@/components/auth/referrer-back-footer";
import { AuthPanelLayout } from "@/components/auth/auth-panel-layout";
import { AuthShell } from "@/components/auth/auth-shell";
import { ctaButtonClassName } from "@/lib/cta-button";

const codesSiteUrl = process.env.NEXT_PUBLIC_CODES_SITE_URL ?? "https://awfixer.codes";

function TotpSetupContent() {
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
    <AuthShell>
      <AuthPanelLayout
        eyebrow="Security"
        title="Set up authenticator"
        description="Two-factor authentication is required for every AWFixer account. Add this entry to your authenticator app, then enter the 6-digit code."
        showFeatures={false}
        footer={<ReferrerBackFooter />}
      >
        <TotpSetupForm
          onComplete={handleComplete}
          embedded
          buttonClassName={ctaButtonClassName("full")}
        />
      </AuthPanelLayout>
    </AuthShell>
  );
}

export default function TotpSetupPage() {
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
      <TotpSetupContent />
    </Suspense>
  );
}

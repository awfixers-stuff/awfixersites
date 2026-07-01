"use client";

import { Suspense } from "react";

import { IdpSignInWithReturn } from "@awfixersites/ui/auth/idp-sign-in-with-return";

import { AuthPanelFeatures } from "@/components/auth/auth-panel-features";
import { AuthPanelFooter } from "@/components/auth/auth-panel-footer";
import { AuthPanelHeader } from "@/components/auth/auth-panel-header";
import { AuthPanel, AuthPanelDivider, AuthPanelSection } from "@/components/auth/auth-panel";
import { ctaButtonClassName } from "@/lib/cta-button";
import { cn } from "@/lib/utils";

function SignInFormFallback() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-14 w-full animate-pulse rounded-full bg-foreground/10" />
      <div className="mx-auto h-4 w-3/4 animate-pulse rounded bg-foreground/10" />
    </div>
  );
}

export function SignInPanel() {
  return (
    <AuthPanel>
      <AuthPanelSection className="pb-8 sm:pb-10">
        <AuthPanelHeader
          eyebrow="Member access"
          title="Welcome back"
          description="Sign in with your AWFixer account to continue on AWFixer's Church."
        />
      </AuthPanelSection>

      <AuthPanelDivider />

      <AuthPanelSection className="space-y-10 py-10 sm:space-y-12 sm:py-12">
        <div
          className={cn(
            "mx-auto w-full max-w-lg space-y-8",
            "[&_[role=alert]]:text-center [&_[role=alert]]:text-sm",
            "[&_p]:text-center [&_p]:text-base [&_p]:text-foreground/55",
            "[&_p_button]:font-medium [&_p_button]:text-foreground/80 [&_p_button]:hover:text-foreground",
          )}
        >
          <Suspense fallback={<SignInFormFallback />}>
            <IdpSignInWithReturn buttonClassName={ctaButtonClassName("full")} />
          </Suspense>
        </div>

        <AuthPanelFeatures />
      </AuthPanelSection>

      <AuthPanelDivider />

      <AuthPanelSection className="py-8 sm:py-10">
        <AuthPanelFooter />
      </AuthPanelSection>
    </AuthPanel>
  );
}

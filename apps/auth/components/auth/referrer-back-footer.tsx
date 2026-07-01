"use client";

import { Suspense } from "react";

import { AuthPanelFooter } from "@/components/auth/auth-panel-footer";
import { useReferrerSite } from "@/lib/use-referrer-site";

type ReferrerBackFooterProps = {
  children?: React.ReactNode;
};

function ReferrerBackFooterContent({ children }: ReferrerBackFooterProps) {
  const referrer = useReferrerSite();

  return (
    <AuthPanelFooter backHref={referrer.href} backLabel={referrer.backLabel}>
      {children}
    </AuthPanelFooter>
  );
}

export function ReferrerBackFooter({ children }: ReferrerBackFooterProps) {
  return (
    <Suspense
      fallback={
        <AuthPanelFooter backHref="https://awfixer.codes" backLabel="Back to AWFixer Codes">
          {children}
        </AuthPanelFooter>
      }
    >
      <ReferrerBackFooterContent>{children}</ReferrerBackFooterContent>
    </Suspense>
  );
}

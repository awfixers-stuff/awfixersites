"use client";

import { AccountSettings } from "@awfixersites/ui/auth";

import { AuthPanelFooter } from "@/components/auth/auth-panel-footer";
import { AuthPanelLayout } from "@/components/auth/auth-panel-layout";
import { AuthShell } from "@/components/auth/auth-shell";
import { ctaButtonClassName, ctaOutlineButtonClassName } from "@/lib/cta-button";

export default function SettingsPage() {
  return (
    <AuthShell>
      <AuthPanelLayout
        eyebrow="Your account"
        title="Account settings"
        description="Manage passkeys and two-factor authentication for your AWFixer identity."
        showFeatures={false}
        footer={<AuthPanelFooter backLabel="Back to sign in" />}
      >
        <AccountSettings
          embedded
          buttonClassName={ctaButtonClassName("full")}
          outlineButtonClassName={ctaOutlineButtonClassName(true)}
        />
      </AuthPanelLayout>
    </AuthShell>
  );
}

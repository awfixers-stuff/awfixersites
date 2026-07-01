"use client";

import { AccountSettings } from "@awfixersites/ui/auth";

import { AuthChrome } from "@/components/auth-chrome";
import { CodesGridBackground } from "@/components/codes-grid-background";

export default function SettingsPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <AuthChrome />
      <CodesGridBackground />
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-24 pt-28">
        <div className="w-full max-w-lg rounded-2xl border border-foreground/10 bg-card p-10 text-card-foreground shadow-lg sm:p-12">
          <AccountSettings />
        </div>
      </div>
    </div>
  );
}
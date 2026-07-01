import { Fingerprint, Globe, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

const features = [
  {
    icon: Fingerprint,
    title: "Passkeys",
    description: "Passwordless sign-in with your device.",
  },
  {
    icon: ShieldCheck,
    title: "Two-factor",
    description: "Authenticator required on every account.",
  },
  {
    icon: Globe,
    title: "One identity",
    description: "Works across every AWFixer site.",
  },
] as const;

export function AuthPanelFeatures() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {features.map((feature) => (
        <div
          key={feature.title}
          className={cn(
            "flex flex-col gap-3 rounded-xl border border-steel/20 bg-steel/5 p-5",
            "text-center sm:text-left",
          )}
        >
          <span className="mx-auto flex size-10 items-center justify-center rounded-xl bg-steel/10 text-steel sm:mx-0">
            <feature.icon className="size-4" aria-hidden />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground/80">{feature.title}</p>
            <p className="text-xs leading-relaxed text-foreground/45">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

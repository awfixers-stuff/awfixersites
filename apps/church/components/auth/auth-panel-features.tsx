import { Globe, KeyRound, Shield } from "lucide-react";

import { cn } from "@/lib/utils";

const features = [
  {
    icon: KeyRound,
    title: "One account",
    description: "Sign in once across every AWFixer site.",
  },
  {
    icon: Shield,
    title: "Passkey-ready",
    description: "Secured through auth.awfixer.me.",
  },
  {
    icon: Globe,
    title: "Everywhere",
    description: "Church, codes, news, and the rest.",
  },
] as const;

export function AuthPanelFeatures() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {features.map((feature) => (
        <div
          key={feature.title}
          className={cn(
            "flex flex-col gap-3 rounded-xl border border-foreground/10 bg-foreground/[0.03] p-5",
            "text-center sm:text-left",
          )}
        >
          <span className="mx-auto flex size-10 items-center justify-center rounded-xl bg-foreground/5 text-foreground/60 sm:mx-0">
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

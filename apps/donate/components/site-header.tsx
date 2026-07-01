import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { DonateTenant } from "@/lib/tenants";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  tenant: DonateTenant;
};

export function SiteHeader({ tenant }: SiteHeaderProps) {
  return (
    <header className="border-b border-glass-border bg-glass/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
        <Link
          href={tenant.parentUrl}
          className={cn(
            "inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors",
            "hover:text-foreground",
          )}
        >
          <ArrowLeft className="size-4" />
          <span>{tenant.displayName}</span>
        </Link>
        <p className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground uppercase">
          Donate
        </p>
      </div>
    </header>
  );
}

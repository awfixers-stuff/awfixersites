import Link from "next/link";

import type { DonateTenant } from "@/lib/tenants";

type SiteFooterProps = {
  tenant: DonateTenant;
};

export function SiteFooter({ tenant }: SiteFooterProps) {
  return (
    <footer className="border-t border-glass-border px-6 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center text-sm text-muted-foreground">
        <p>
          All donations are made to{" "}
          <strong className="text-foreground">AWFixer&apos;s Church</strong>, a 501(c)(3) nonprofit.
          Contributions are tax-deductible to the extent permitted by law.
        </p>
        <p>
          You arrived from{" "}
          <Link href={tenant.parentUrl} className="text-foreground hover:underline">
            {tenant.displayName}
          </Link>
          . Questions?{" "}
          <a href={`mailto:${tenant.contactEmail}`} className="text-foreground hover:underline">
            {tenant.contactEmail}
          </a>
        </p>
        <p className="font-mono text-xs">
          Press <kbd className="rounded border px-1">d</kbd> to toggle dark mode
        </p>
      </div>
    </footer>
  );
}

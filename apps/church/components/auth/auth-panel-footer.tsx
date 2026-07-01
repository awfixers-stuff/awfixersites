import Link from "next/link";

import { ctaOutlineButtonClassName } from "@/lib/cta-button";

export function AuthPanelFooter() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <Link href="/" className={ctaOutlineButtonClassName(true)}>
        Back to home
      </Link>

      <p className="max-w-md text-xs leading-relaxed text-foreground/40 font-mono">
        Your AWFixer account is managed at auth.awfixer.me — the same identity across the movement.
      </p>
    </div>
  );
}

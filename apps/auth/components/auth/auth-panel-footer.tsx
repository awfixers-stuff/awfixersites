import { CLink as Link } from "@awfixersites/telemetry/link";

import { ctaOutlineButtonClassName } from "@/lib/cta-button";

type AuthPanelFooterProps = {
  children?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
};

export function AuthPanelFooter({
  children,
  backHref = "/",
  backLabel = "Back to sign in",
}: AuthPanelFooterProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {children}

      <Link href={backHref} className={ctaOutlineButtonClassName(true)}>
        {backLabel}
      </Link>

      <p className="max-w-md text-xs leading-relaxed text-foreground/40 font-mono">
        auth.awfixer.me — your single identity across the AWFixer movement.
      </p>
    </div>
  );
}

"use client";

import { CLink as Link } from "@awfixersites/telemetry/link";
import { useSplash } from "./splash-provider";

export function NavLink({ href, onClick, ...props }: React.ComponentPropsWithoutRef<typeof Link>) {
  const { triggerSplash } = useSplash();

  return (
    <Link
      href={href}
      onClick={(event) => {
        triggerSplash();
        onClick?.(event);
      }}
      {...props}
    />
  );
}

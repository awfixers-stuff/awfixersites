"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useIsAuthenticated } from "@awfixersites/auth/session";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isPending } = useIsAuthenticated();

  useEffect(() => {
    if (!isPending && !isAuthenticated) {
      const returnTo = pathname;
      router.push(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
    }
  }, [isAuthenticated, isPending, pathname, router]);

  if (isPending || !isAuthenticated) {
    return (
      <div className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Verifying credentials…
        </p>
      </div>
    );
  }

  return children;
}

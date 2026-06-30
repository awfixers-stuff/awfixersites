"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useMemo, type ReactNode } from "react";

type ConvexClientProviderProps = {
  children: ReactNode;
};

export function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  const client = useMemo(() => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      throw new Error(
        "Missing NEXT_PUBLIC_CONVEX_URL. Set it in apps/army/.env.local (dev) or your deployment environment.",
      );
    }

    return new ConvexReactClient(convexUrl);
  }, []);

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
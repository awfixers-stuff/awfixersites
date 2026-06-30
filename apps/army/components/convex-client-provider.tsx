"use client";

import { ConvexClientProvider } from "@awfixersites/db/provider";

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}

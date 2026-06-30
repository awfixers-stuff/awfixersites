"use client";

import { authClient } from "./client";

export function useSession() {
  return authClient.useSession();
}

export function useIsAuthenticated() {
  const { data, isPending } = useSession();
  return { isAuthenticated: !!data?.session, isPending };
}

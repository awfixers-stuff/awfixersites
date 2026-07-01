import type { AuthSession } from "../client";

export function isAdminSession(session: AuthSession | null | undefined) {
  const user = session?.user as { role?: string } | undefined;
  return user?.role === "admin";
}

export function requireAdminSession(session: AuthSession | null | undefined) {
  if (!isAdminSession(session)) {
    throw new Error("Administrator access required.");
  }
}

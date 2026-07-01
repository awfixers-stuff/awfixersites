import { createMiddleware } from "@arcjet/next";
import type { NextMiddleware } from "next/server";

type ArcjetMiddlewareClient = Parameters<typeof createMiddleware>[0];

/**
 * Wraps Arcjet's Next.js middleware helper for app-level security rules.
 */
export function createAppSecurityMiddleware(
  arcjetClient: ArcjetMiddlewareClient,
  existingMiddleware?: NextMiddleware,
): NextMiddleware {
  return createMiddleware(arcjetClient, existingMiddleware);
}

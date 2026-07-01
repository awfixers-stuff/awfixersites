import { headers } from "next/headers";

import type { AuthSession } from "../client";
import { getIdpOrigin } from "../idp";
import { idpPrisma } from "../idp-prisma";
import { OAUTH_IDP_PROVIDER_ID } from "../oauth-clients";
import { isAuthClientDeployment, isAuthIdpDeployment } from "../deployment";
import { getAuth } from "../server";

export function isAdminSession(session: AuthSession | null | undefined) {
  const user = session?.user as { role?: string } | undefined;
  return user?.role === "admin";
}

export function requireAdminSession(session: AuthSession | null | undefined) {
  if (!isAdminSession(session)) {
    throw new Error("Administrator access required.");
  }
}

export async function isAdminSessionFresh(session: AuthSession | null | undefined) {
  if (!session?.user?.id) {
    return false;
  }

  if (isAuthIdpDeployment()) {
    const user = await idpPrisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    return user?.role === "admin";
  }

  if (!isAuthClientDeployment()) {
    return isAdminSession(session);
  }

  try {
    const auth = getAuth();
    const tokenResult = await auth.api.getAccessToken({
      headers: await headers(),
      body: { providerId: OAUTH_IDP_PROVIDER_ID },
    });

    const accessToken =
      tokenResult && typeof tokenResult === "object" && "accessToken" in tokenResult
        ? (tokenResult as { accessToken?: string }).accessToken
        : undefined;

    if (!accessToken) {
      return false;
    }

    const response = await fetch(`${getIdpOrigin()}/api/auth/oauth2/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return false;
    }

    const profile = (await response.json()) as { role?: string };
    return profile.role === "admin";
  } catch {
    return false;
  }
}

import { idpPrisma } from "../idp-prisma";
import { getOAuthSiteClients } from "../oauth-clients";

export async function listOauthApplications() {
  const registered = await idpPrisma.oauthApplication.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      clientId: true,
      redirectUrls: true,
      disabled: true,
      type: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const configured = getOAuthSiteClients();

  return {
    registered,
    configured,
  };
}

export async function setOauthApplicationDisabled(clientId: string, disabled: boolean) {
  return idpPrisma.oauthApplication.update({
    where: { clientId },
    data: { disabled },
    select: {
      clientId: true,
      disabled: true,
      name: true,
    },
  });
}

import { idpPrisma } from "../idp-prisma";

export async function listUsersForAdmin(options?: { query?: string; limit?: number }) {
  const limit = options?.limit ?? 50;
  const query = options?.query?.trim().toLowerCase();

  return idpPrisma.user.findMany({
    where: query
      ? {
          OR: [
            { username: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      username: true,
      displayUsername: true,
      email: true,
      role: true,
      twoFactorEnabled: true,
      createdAt: true,
      _count: {
        select: {
          passkeys: true,
          oauthConsents: true,
          sessions: true,
        },
      },
    },
  });
}

export async function updateUserRole(userId: string, role: "user" | "admin") {
  return idpPrisma.user.update({
    where: { id: userId },
    data: { role },
    select: {
      id: true,
      username: true,
      role: true,
    },
  });
}

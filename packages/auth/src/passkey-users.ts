import { hashPassword } from "better-auth/crypto";

import { resolveUserRole } from "./account-setup";
import { internalUserEmail } from "./config";
import { prisma } from "./prisma";

function randomPassword() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

function createId() {
  return crypto.randomUUID();
}

export async function findOrCreateUserForPasskey(username: string) {
  const normalized = username.trim().toLowerCase();
  const email = internalUserEmail(normalized);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username: normalized }, { email }],
    },
    select: {
      id: true,
      username: true,
      displayUsername: true,
    },
  });

  if (existing?.username) {
    return {
      id: existing.id,
      username: existing.username,
      displayUsername: existing.displayUsername ?? existing.username,
    };
  }

  const now = new Date();
  const userId = createId();

  const user = await prisma.user.create({
    data: {
      id: userId,
      email,
      emailVerified: true,
      name: normalized,
      username: normalized,
      displayUsername: normalized,
      role: resolveUserRole(normalized),
      createdAt: now,
      updatedAt: now,
    },
    select: {
      id: true,
      username: true,
      displayUsername: true,
    },
  });

  await prisma.account.create({
    data: {
      id: createId(),
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: await hashPassword(randomPassword()),
      createdAt: now,
      updatedAt: now,
    },
  });

  return {
    id: user.id,
    username: user.username!,
    displayUsername: user.displayUsername ?? user.username!,
  };
}

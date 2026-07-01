import { hashPassword } from "better-auth/crypto";

import { internalUserEmail } from "./config";
import { prisma } from "./prisma";
import { generateSnowflakeId } from "./snowflake";

export class PasskeyUsernameTakenError extends Error {
  constructor(username: string) {
    super(`Username "${username}" is already taken.`);
    this.name = "PasskeyUsernameTakenError";
  }
}

function randomPassword() {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

export async function createUserForPasskeySignup(username: string) {
  const normalized = username.trim().toLowerCase();
  const email = internalUserEmail(normalized);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username: normalized }, { email }],
    },
    select: { id: true },
  });

  if (existing) {
    throw new PasskeyUsernameTakenError(normalized);
  }

  const now = new Date();
  const userId = generateSnowflakeId();

  const user = await prisma.user.create({
    data: {
      id: userId,
      email,
      emailVerified: true,
      name: normalized,
      username: normalized,
      displayUsername: normalized,
      role: "user",
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
      id: generateSnowflakeId(),
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

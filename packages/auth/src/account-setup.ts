export type AccountSetupUser = {
  twoFactorEnabled?: boolean | null;
};

export type AccountSetupStatus = {
  passkeyCount: number;
  twoFactorEnabled: boolean;
};

export function isAccountSetupComplete(status: AccountSetupStatus): boolean {
  return status.passkeyCount >= 1 && status.twoFactorEnabled;
}

export async function getAccountSetupStatus(
  prisma: {
    passkey: { count: (args: { where: { userId: string } }) => Promise<number> };
  },
  userId: string,
  user: AccountSetupUser,
): Promise<AccountSetupStatus> {
  const passkeyCount = await prisma.passkey.count({
    where: { userId },
  });

  return {
    passkeyCount,
    twoFactorEnabled: user.twoFactorEnabled === true,
  };
}

export function getAccountSetupRedirect(
  status: AccountSetupStatus,
): "/setup/totp" | "/verify/totp" | null {
  if (status.passkeyCount < 1) {
    return null;
  }

  if (!status.twoFactorEnabled) {
    return "/setup/totp";
  }

  return null;
}

export function getAdminUsernames(): Set<string> {
  const raw = process.env.AUTH_ADMIN_USERNAMES ?? "";
  return new Set(
    raw
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function resolveUserRole(username: string | null | undefined): "user" | "admin" {
  if (!username) {
    return "user";
  }
  return getAdminUsernames().has(username.trim().toLowerCase()) ? "admin" : "user";
}

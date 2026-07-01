import {
  getAccountSetupRedirect,
  getAccountSetupStatus,
  isAccountSetupComplete,
  type AccountSetupUser,
} from "./account-setup";
import { prisma } from "./prisma";

export async function getAccountSetupForUser(userId: string, user: AccountSetupUser) {
  const status = await getAccountSetupStatus(prisma, userId, user);
  return {
    status,
    complete: isAccountSetupComplete(status),
    redirect: getAccountSetupRedirect(status),
  };
}

export { isAccountSetupComplete, getAccountSetupRedirect };

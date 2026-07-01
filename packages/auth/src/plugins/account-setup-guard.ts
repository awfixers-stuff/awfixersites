import type { BetterAuthPlugin } from "better-auth";
import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";

import type { AccountSetupUser } from "../account-setup";
import { getAccountSetupStatus, isAccountSetupComplete } from "../account-setup";
import { prisma } from "../prisma";

const GUARDED_PATHS = new Set(["/oauth2/authorize", "/oauth2/token", "/oauth2/userinfo"]);

export function accountSetupGuardPlugin(): BetterAuthPlugin {
  return {
    id: "account-setup-guard",
    hooks: {
      before: [
        {
          matcher(context) {
            return GUARDED_PATHS.has(context.path ?? "");
          },
          handler: createAuthMiddleware(async (ctx) => {
            const session = await getSessionFromCtx(ctx);
            if (!session?.user?.id) return;

            const user = session.user as AccountSetupUser & { id: string };
            const status = await getAccountSetupStatus(prisma, user.id, user);

            if (isAccountSetupComplete(status)) return;

            throw new APIError("FORBIDDEN", {
              message: "Complete passkey and two-factor setup before continuing.",
            });
          }),
        },
      ],
    },
  };
}

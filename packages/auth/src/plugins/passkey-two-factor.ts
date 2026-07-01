import type { BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { deleteSessionCookie, expireCookie } from "better-auth/cookies";
import { generateRandomString } from "better-auth/crypto";
import { createHMAC } from "@better-auth/utils/hmac";

const TWO_FACTOR_COOKIE_NAME = "two_factor";
const TRUST_DEVICE_COOKIE_NAME = "trust_device";
const TRUST_DEVICE_MAX_AGE = 720 * 60 * 60;
const TWO_FACTOR_COOKIE_MAX_AGE = 600;
const TWO_FACTOR_TABLE = "twoFactor";

export function passkeyTwoFactorPlugin(): BetterAuthPlugin {
  return {
    id: "passkey-two-factor",
    hooks: {
      after: [
        {
          matcher(context) {
            return context.path === "/passkey/verify-authentication";
          },
          handler: createAuthMiddleware(async (ctx) => {
            const data = ctx.context.newSession;
            if (!data) return;
            if (!data.user.twoFactorEnabled) return;

            const trustDeviceCookieAttrs = ctx.context.createAuthCookie(TRUST_DEVICE_COOKIE_NAME, {
              maxAge: TRUST_DEVICE_MAX_AGE,
            });
            const trustDeviceCookie = await ctx.getSignedCookie(
              trustDeviceCookieAttrs.name,
              ctx.context.secret,
            );

            if (trustDeviceCookie) {
              const [token, trustIdentifier] = trustDeviceCookie.split("!");
              if (token && trustIdentifier) {
                const expected = await createHMAC("SHA-256", "base64urlnopad").sign(
                  ctx.context.secret,
                  `${data.user.id}!${trustIdentifier}`,
                );
                if (token === expected) {
                  const verificationRecord =
                    await ctx.context.internalAdapter.findVerificationValue(trustIdentifier);
                  if (
                    verificationRecord &&
                    verificationRecord.value === data.user.id &&
                    verificationRecord.expiresAt > new Date()
                  ) {
                    await ctx.context.internalAdapter.deleteVerificationByIdentifier(
                      trustIdentifier,
                    );
                    const newTrustIdentifier = `trust-device-${generateRandomString(32)}`;
                    const newToken = await createHMAC("SHA-256", "base64urlnopad").sign(
                      ctx.context.secret,
                      `${data.user.id}!${newTrustIdentifier}`,
                    );
                    await ctx.context.internalAdapter.createVerificationValue({
                      value: data.user.id,
                      identifier: newTrustIdentifier,
                      expiresAt: new Date(Date.now() + TRUST_DEVICE_MAX_AGE * 1_000),
                    });
                    const newTrustDeviceCookie = ctx.context.createAuthCookie(
                      TRUST_DEVICE_COOKIE_NAME,
                      { maxAge: TRUST_DEVICE_MAX_AGE },
                    );
                    await ctx.setSignedCookie(
                      newTrustDeviceCookie.name,
                      `${newToken}!${newTrustIdentifier}`,
                      ctx.context.secret,
                      trustDeviceCookieAttrs.attributes,
                    );
                    return;
                  }
                }
              }
              expireCookie(ctx, trustDeviceCookieAttrs);
            }

            deleteSessionCookie(ctx, true);
            await ctx.context.internalAdapter.deleteSession(data.session.token);
            ctx.context.setNewSession(null);

            const twoFactorCookie = ctx.context.createAuthCookie(TWO_FACTOR_COOKIE_NAME, {
              maxAge: TWO_FACTOR_COOKIE_MAX_AGE,
            });
            const identifier = `2fa-${generateRandomString(20)}`;
            await ctx.context.internalAdapter.createVerificationValue({
              value: data.user.id,
              identifier,
              expiresAt: new Date(Date.now() + TWO_FACTOR_COOKIE_MAX_AGE * 1_000),
            });
            await ctx.setSignedCookie(
              twoFactorCookie.name,
              identifier,
              ctx.context.secret,
              twoFactorCookie.attributes,
            );

            const userTotpSecret = (await ctx.context.adapter.findOne({
              model: TWO_FACTOR_TABLE,
              where: [{ field: "userId", value: data.user.id }],
            })) as { verified?: boolean } | null;
            const twoFactorMethods =
              userTotpSecret && userTotpSecret.verified !== false ? ["totp"] : [];

            return ctx.json({
              twoFactorRedirect: true,
              twoFactorMethods,
            });
          }),
        },
      ],
    },
  };
}

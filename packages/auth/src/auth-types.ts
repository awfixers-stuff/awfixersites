/**
 * Structural types for the Better Auth server returned by `betterAuth(createAuthOptions(prisma))`.
 * Declared here so consumers do not depend on `ReturnType<typeof …>`.
 */
export interface AwfixerBetterAuthSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
    role?: string;
    twoFactorEnabled?: boolean | null;
    [key: string]: unknown;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    [key: string]: unknown;
  };
}

export interface AwfixerBetterAuthServer {
  api: {
    getSession: (args: {
      headers: Headers | Record<string, string>;
    }) => Promise<AwfixerBetterAuthSession | null>;
    getAccessToken: (args: {
      headers: Headers | Record<string, string>;
      body: { providerId: string; accountId?: string; userId?: string };
    }) => Promise<{ accessToken?: string } | null>;
  };
  /** Next.js route adapter entrypoint (Better Auth). */
  handler: (request: Request) => Promise<Response>;
  $Infer: {
    Session: AwfixerBetterAuthSession;
  };
}

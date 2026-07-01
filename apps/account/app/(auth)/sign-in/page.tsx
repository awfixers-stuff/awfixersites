import Link from "next/link";
import { Suspense } from "react";

import { IdpSignInWithReturn } from "@awfixersites/ui/auth/idp-sign-in-with-return";

export const metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            AWFixer Account
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your passkey and authenticator via auth.awfixer.me.
          </p>
        </div>

        <Suspense fallback={<div className="h-48" />}>
          <IdpSignInWithReturn />
        </Suspense>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}

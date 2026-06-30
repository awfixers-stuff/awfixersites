import Link from "next/link";
import { Suspense } from "react";

import { SignInForm } from "@awfixersites/ui/auth";

export const metadata = {
  title: "Sign in",
};

function SignInWithReturn() {
  const returnTo =
    typeof window !== "undefined"
      ? (new URLSearchParams(window.location.search).get("returnTo") ?? undefined)
      : undefined;
  return <SignInForm returnTo={returnTo} />;
}

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in with your username and password or a passkey.
          </p>
        </div>

        <Suspense fallback={<div className="h-48" />}>
          <SignInWithReturn />
        </Suspense>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}

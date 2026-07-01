"use client";

import { useSearchParams } from "next/navigation";

import { IdpSignInForm } from "./idp-sign-in-form";

export function IdpSignInWithReturn() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? undefined;
  return <IdpSignInForm returnTo={returnTo} />;
}

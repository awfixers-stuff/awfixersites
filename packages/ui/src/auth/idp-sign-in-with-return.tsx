"use client";

import { useSearchParams } from "next/navigation";

import { IdpSignInForm } from "./idp-sign-in-form";

type IdpSignInWithReturnProps = {
  buttonClassName?: string;
};

export function IdpSignInWithReturn({ buttonClassName }: IdpSignInWithReturnProps = {}) {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? undefined;
  return <IdpSignInForm returnTo={returnTo} buttonClassName={buttonClassName} />;
}

import { redirect } from "next/navigation";

import { getIdpSignInUrl } from "@awfixersites/auth/idp";

export const metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  const url = new URL(getIdpSignInUrl());
  url.searchParams.set("mode", "sign-up");
  redirect(url.toString());
}

import { SignInPanel } from "@/components/auth/sign-in-panel";

export const metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-20 lg:py-28 min-h-[calc(100svh-5rem)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-bleach/30 to-transparent" />

      <div className="relative z-10 flex w-full justify-center">
        <SignInPanel />
      </div>
    </div>
  );
}

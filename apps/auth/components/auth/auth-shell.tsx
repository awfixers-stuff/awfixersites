import { AuthSiteHeader } from "@/components/auth/auth-site-header";

type AuthShellProps = {
  children: React.ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <AuthSiteHeader />
      <div className="relative flex flex-1 flex-col pt-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-steel/10 to-transparent" />
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-20 lg:py-28 min-h-[calc(100svh-5rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}

import { RequireAuth } from "@awfixersites/ui/auth";

export const metadata = {
  title: "Sessions",
};

export default function SessionsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <RequireAuth>
        <div className="space-y-4">
          <h1 className="font-display text-3xl tracking-tight">Sessions</h1>
          <p className="text-sm text-muted-foreground">
            Active sessions for this OAuth client are stored in the account app session database.
            Revoke access from security settings on auth.awfixer.me.
          </p>
        </div>
      </RequireAuth>
    </div>
  );
}

import { RequireAuth } from "@awfixersites/ui/auth";

export const metadata = {
  title: "Linked apps",
};

export default function AppsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <RequireAuth>
        <div className="space-y-4">
          <h1 className="font-display text-3xl tracking-tight">Linked apps</h1>
          <p className="text-sm text-muted-foreground">
            OAuth consents you have granted across AWFixer properties appear here. Admin operators
            can inspect all clients from the admin dashboard.
          </p>
        </div>
      </RequireAuth>
    </div>
  );
}
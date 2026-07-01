import { RequireAuth } from "@awfixersites/ui/auth";

import { AccountDashboard } from "@/components/account-dashboard";

export default function Page() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <RequireAuth>
        <AccountDashboard />
      </RequireAuth>
    </div>
  );
}

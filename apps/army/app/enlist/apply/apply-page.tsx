"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { useSubmitEnlistment } from "@awfixersites/db/hooks";
import { Button } from "@awfixersites/ui/components/button";
import { NavLink } from "@/components/nav-link";
import { RequireAuth } from "@awfixersites/ui/auth";
import { EnlistForm, type EnlistFormValues } from "@awfixersites/ui/enlist";

export function ApplyPage() {
  return (
    <RequireAuth>
      <ApplyPageInner />
    </RequireAuth>
  );
}

function ApplyPageInner() {
  const router = useRouter();
  const submitEnlistment = useSubmitEnlistment();
  const [submitted, setSubmitted] = useState<EnlistFormValues | null>(null);

  const handleSubmit = useCallback(
    async (values: EnlistFormValues) => {
      await submitEnlistment(values);
    },
    [submitEnlistment],
  );

  if (submitted) {
    return (
      <main className="min-h-[calc(100svh-3.5rem)] p-6">
        <section className="mx-auto max-w-xl border border-border/50 p-8 text-center">
          <p className="font-mono text-[0.65rem] tracking-[0.18em] text-crimson uppercase">
            File received
          </p>
          <h1 className="font-display mt-3 text-3xl font-bold text-bleach uppercase">
            {submitted.callsign}
          </h1>
          <p className="mt-4 text-muted-foreground">
            Your enlistment is in the queue. Watch{" "}
            <span className="text-bleach">{submitted.email}</span> for word from the unit.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              className="font-mono"
              onClick={() => setSubmitted(null)}
            >
              Submit another application
            </Button>
            <Button asChild className="font-mono">
              <NavLink href="/enlist">Back to enlist</NavLink>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100svh-3.5rem)] p-6">
      <div className="mx-auto max-w-2xl py-4">
        <EnlistForm
          onCancel={() => router.push("/enlist")}
          onSuccess={(values) => setSubmitted(values)}
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}

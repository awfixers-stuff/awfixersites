import { CLink as Link } from "@awfixersites/telemetry/link";
import { Button } from "@awfixersites/ui/components/button";

const wired = [
  { label: "Telemetry", detail: "CLink, clink.json, instrumentation.ts" },
  { label: "Auth", detail: "OAuth client route, sign-in/up, BotID" },
  { label: "Security", detail: "Arcjet middleware (lib/security.ts)" },
  { label: "Utils", detail: "withAppUtils, flags, streamdown via AppUtils" },
  { label: "Vercel", detail: "Analytics, Speed Insights, vercel.ts" },
] as const;

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-lg min-w-0 flex-col gap-6 text-sm leading-relaxed">
        <div className="space-y-2">
          <h1 className="text-base font-medium">Template app</h1>
          <p className="text-muted-foreground">
            Copy this app when scaffolding a new site. It ships with shared monorepo wiring —
            replace this page with your product UI.
          </p>
          <Button className="mt-1">Button</Button>
        </div>

        <div className="space-y-3">
          <h2 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            Wired configs
          </h2>
          <ul className="space-y-2">
            {wired.map((item) => (
              <li key={item.label} className="rounded-lg border border-border px-3 py-2">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground"> — {item.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2 text-muted-foreground">
          <p>
            <Link href="/sign-in" className="text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>{" "}
            demonstrates the OAuth client flow.
          </p>
          <p className="font-mono text-xs">
            (Press <kbd>d</kbd> to toggle dark mode)
          </p>
        </div>
      </div>
    </div>
  );
}

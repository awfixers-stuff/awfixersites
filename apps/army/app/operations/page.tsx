import { PageIntro } from "@/components/page-intro";
import { NavLink } from "@/components/nav-link";

const operations = [
  {
    status: "Active",
    name: "Extraction & relocation",
    detail:
      "Moving Americans out of situations where the government has decided they are replaceable — before that decision becomes irreversible.",
  },
  {
    status: "Standing by",
    name: "Community defense",
    detail:
      "Local standing forces for families and neighborhoods the state has stopped answering for. Presence, not performance.",
  },
  {
    status: "In the field",
    name: "Readiness & training",
    detail:
      "Drills, certifications, and unit cohesion so every soldier knows their role when the call comes. No one deploys untrained.",
  },
];

export default function OperationsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <PageIntro label="Field report" title="Operations">
        <p>
          What the militia is doing now — not press releases, not promises. Active work to save
          people the government would rather replace.
        </p>
      </PageIntro>

      <ol className="mt-12 space-y-0 divide-y divide-border/40 border-y border-border/40">
        {operations.map((op) => (
          <li key={op.name} className="py-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-[0.65rem] tracking-[0.15em] text-crimson uppercase">
                {op.status}
              </span>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-bleach uppercase">
                {op.name}
              </h2>
            </div>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
              {op.detail}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-10 text-sm text-muted-foreground">
        Ready to stand the line?{" "}
        <NavLink
          href="/enlist"
          className="text-bleach underline-offset-4 hover:text-crimson hover:underline"
        >
          Enlist
        </NavLink>{" "}
        or find a sponsor already in the ranks.
      </p>
    </main>
  );
}

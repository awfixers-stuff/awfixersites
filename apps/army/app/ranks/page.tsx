import { PageIntro } from "@/components/page-intro";
import { NavLink } from "@/components/nav-link";
import { ranks } from "@awfixersites/content/ranks";
import { cn } from "@awfixersites/ui/lib/utils";

const orderedRanks = [...ranks].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

export default function RanksPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <PageIntro label="Chain of command" title="Ranks">
        <p>
          Six ranks from first enlistment to Commander in Chief. Every soldier answers up the chain.
          The mission does not change — save the people they would rather replace.
        </p>
      </PageIntro>

      <ol className="relative mt-12">
        <div
          aria-hidden
          className="absolute top-6 bottom-6 left-[1.35rem] w-px bg-border/60 sm:left-[1.65rem]"
        />
        {orderedRanks.map((rank, index) => (
          <li key={rank.slug} className="relative pb-8 last:pb-0">
            <NavLink
              href={`/ranks/${rank.slug}`}
              className={cn(
                "group grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-6",
                "rounded-sm py-1 pl-0 transition-colors",
              )}
            >
              <div className="flex items-start gap-4 sm:flex-col sm:items-center sm:gap-2">
                <span
                  className={cn(
                    "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center",
                    "border border-border/70 bg-background font-mono text-lg text-crimson",
                    "transition-colors group-hover:border-crimson/60 group-hover:bg-muted/30",
                  )}
                  aria-hidden
                >
                  {rank.insignia}
                </span>
                <span className="font-mono text-[0.65rem] tracking-[0.12em] text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div
                className={cn(
                  "min-w-0 pb-8",
                  index < orderedRanks.length - 1 && "border-b border-border/30",
                )}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-display text-2xl font-semibold tracking-tight text-bleach uppercase group-hover:text-crimson">
                    {rank.title}
                  </span>
                  {rank.holder ? (
                    <span className="font-mono text-[0.65rem] tracking-wide text-crimson uppercase">
                      {rank.holder}
                    </span>
                  ) : null}
                  {rank.equalRank ? (
                    <span className="font-mono text-[0.65rem] text-muted-foreground">
                      = {ranks.find((entry) => entry.slug === rank.equalRank)?.title}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {rank.summary}
                </p>
              </div>
            </NavLink>
          </li>
        ))}
      </ol>

      <div className="mt-10 border-t border-border/40 pt-8">
        <NavLink
          href="/enlist"
          className="inline-flex items-center rounded-sm border border-crimson bg-crimson px-5 py-2.5 font-mono text-sm font-medium text-bleach transition-colors hover:bg-bleach hover:text-crimson"
        >
          File enlistment
        </NavLink>
      </div>
    </main>
  );
}

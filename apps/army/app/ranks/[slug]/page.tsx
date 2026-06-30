import { notFound } from "next/navigation";

import { NavLink } from "@/components/nav-link";
import {
  getAdjacentRanks,
  getRank,
  getRankContent,
  hasRankContent,
  rankSlugs,
} from "@awfixersites/content/ranks";

type RankPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return rankSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: RankPageProps) {
  const { slug } = await params;
  const rank = getRank(slug);
  if (!rank) return { title: "Rank not found" };

  return {
    title: `${rank.title} | Ranks`,
    description: rank.summary,
  };
}

export default async function RankPage({ params }: RankPageProps) {
  const { slug } = await params;
  const rank = getRank(slug);
  if (!rank || !hasRankContent(slug)) notFound();

  const RankContent = getRankContent(slug);
  const equalRank = rank.equalRank ? getRank(rank.equalRank) : undefined;
  const { previous, next } = getAdjacentRanks(slug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <article>
        <NavLink
          href="/ranks"
          className="font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase transition-colors hover:text-crimson"
        >
          ← All ranks
        </NavLink>

        <header className="mt-6 border-b border-border/40 pb-8">
          <div className="flex items-start gap-5">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center border border-border/70 bg-background font-mono text-2xl text-crimson"
              aria-hidden
            >
              {rank.insignia}
            </span>
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-bleach uppercase sm:text-5xl">
                {rank.title}
              </h1>
              {rank.holder ? (
                <p className="mt-2 font-mono text-[0.7rem] tracking-wide text-crimson uppercase">
                  Held by {rank.holder}
                </p>
              ) : null}
              {equalRank ? (
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  Equal to{" "}
                  <NavLink
                    href={`/ranks/${equalRank.slug}`}
                    className="text-bleach hover:text-crimson"
                  >
                    {equalRank.title}
                  </NavLink>
                </p>
              ) : null}
              <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground">
                {rank.summary}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-8">
          <RankContent />
        </div>

        <nav className="mt-12 flex flex-col gap-3 border-t border-border/40 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {previous ? (
              <NavLink
                href={`/ranks/${previous.slug}`}
                className="font-mono text-sm text-muted-foreground transition-colors hover:text-crimson"
              >
                ← {previous.title}
              </NavLink>
            ) : (
              <span className="font-mono text-sm text-muted-foreground/50">Start of chain</span>
            )}
          </div>
          <div className="sm:text-right">
            {next ? (
              <NavLink
                href={`/ranks/${next.slug}`}
                className="font-mono text-sm text-muted-foreground transition-colors hover:text-crimson"
              >
                {next.title} →
              </NavLink>
            ) : (
              <span className="font-mono text-sm text-muted-foreground/50">Top of chain</span>
            )}
          </div>
        </nav>

        {rank.slug === "enlisty" || rank.slug === "recruit" ? (
          <div className="mt-8 flex justify-center">
            <NavLink
              href="/enlist"
              className="inline-flex items-center rounded-sm border border-crimson bg-crimson px-5 py-2.5 font-mono text-sm font-medium text-bleach transition-colors hover:bg-bleach hover:text-crimson"
            >
              File enlistment
            </NavLink>
          </div>
        ) : null}
      </article>
    </main>
  );
}

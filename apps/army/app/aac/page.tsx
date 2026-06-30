import { PageIntro } from "@/components/page-intro";
import { NavLink } from "@/components/nav-link";
import { aacArticles } from "@awfixersites/content/aac";
import { cn } from "@awfixersites/ui/lib/utils";

const orderedArticles = [...aacArticles].sort((a, b) => a.order - b.order);

export default function AacPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <PageIntro label="Binding law" title="AWFixer Army Code">
        <p>
          The AAC governs conduct, operations, and discipline for every soldier in the militia.
          Seven articles from oath to enforcement. Read them before you enlist — you are bound by
          them after.
        </p>
      </PageIntro>

      <ol className="relative mt-12">
        <div
          aria-hidden
          className="absolute top-6 bottom-6 left-[1.35rem] w-px bg-border/60 sm:left-[1.65rem]"
        />
        {orderedArticles.map((article, index) => (
          <li key={article.slug} className="relative pb-8 last:pb-0">
            <NavLink
              href={`/aac/${article.slug}`}
              className={cn(
                "group grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-6",
                "rounded-sm py-1 pl-0 transition-colors",
              )}
            >
              <div className="flex items-start gap-4 sm:flex-col sm:items-center sm:gap-2">
                <span
                  className={cn(
                    "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center",
                    "border border-border/70 bg-background font-mono text-sm text-crimson",
                    "transition-colors group-hover:border-crimson/60 group-hover:bg-muted/30",
                  )}
                  aria-hidden
                >
                  {article.order === 0 ? "§" : String(article.order).padStart(2, "0")}
                </span>
              </div>

              <div
                className={cn(
                  "min-w-0 pb-8",
                  index < orderedArticles.length - 1 && "border-b border-border/30",
                )}
              >
                <span className="font-display text-2xl font-semibold tracking-tight text-bleach uppercase group-hover:text-crimson">
                  {article.title}
                </span>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {article.summary}
                </p>
              </div>
            </NavLink>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-border/40 pt-8">
        <NavLink
          href="/aacj"
          className="inline-flex items-center rounded-sm border border-border/60 px-5 py-2.5 font-mono text-sm text-muted-foreground transition-colors hover:border-navy hover:text-bleach"
        >
          Code of Justice
        </NavLink>
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

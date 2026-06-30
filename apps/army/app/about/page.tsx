import { PageIntro } from "@/components/page-intro";
import { NavLink } from "@/components/nav-link";
import { AboutContent } from "@awfixersites/content/about";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <PageIntro label="Unit brief" title="About" className="mb-10" />
      <article>
        <AboutContent />
      </article>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-border/40 pt-8">
        <NavLink
          href="/enlist"
          className="inline-flex items-center rounded-sm border border-crimson bg-crimson px-5 py-2.5 font-mono text-sm font-medium text-bleach transition-colors hover:bg-bleach hover:text-crimson"
        >
          Enlist
        </NavLink>
        <NavLink
          href="/ranks"
          className="inline-flex items-center rounded-sm border border-border/60 px-5 py-2.5 font-mono text-sm text-muted-foreground transition-colors hover:border-navy hover:text-bleach"
        >
          View ranks
        </NavLink>
      </div>
    </main>
  );
}

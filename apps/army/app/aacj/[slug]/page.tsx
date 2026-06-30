import { notFound } from "next/navigation";

import { NavLink } from "@/components/nav-link";
import {
  aacjArticles,
  getAdjacentAacjArticles,
  getAacjArticle,
  getAacjContent,
  hasAacjContent,
} from "@awfixersites/content/aacj";

type AacjArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return aacjArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: AacjArticlePageProps) {
  const { slug } = await params;
  const article = getAacjArticle(slug);
  if (!article) return { title: "Article not found" };

  return {
    title: `${article.title} | AACJ`,
    description: article.summary,
  };
}

export default async function AacjArticlePage({ params }: AacjArticlePageProps) {
  const { slug } = await params;
  const article = getAacjArticle(slug);
  if (!article || !hasAacjContent(slug)) notFound();

  const ArticleContent = getAacjContent(slug);
  const { previous, next } = getAdjacentAacjArticles(slug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <article>
        <NavLink
          href="/aacj"
          className="font-mono text-[0.65rem] tracking-[0.15em] text-muted-foreground uppercase transition-colors hover:text-crimson"
        >
          ← Code of Justice
        </NavLink>

        <header className="mt-6 border-b border-border/40 pb-8">
          <p className="font-mono text-[0.65rem] tracking-[0.12em] text-crimson uppercase">
            {article.order === 0 ? "Preamble" : `Article ${article.order}`}
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight text-bleach uppercase sm:text-5xl">
            {article.title.replace(/^Article [IVX]+ — /, "")}
          </h1>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground">
            {article.summary}
          </p>
        </header>

        <div className="mt-8">
          <ArticleContent />
        </div>

        <nav className="mt-12 flex flex-col gap-3 border-t border-border/40 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {previous ? (
              <NavLink
                href={`/aacj/${previous.slug}`}
                className="font-mono text-sm text-muted-foreground transition-colors hover:text-crimson"
              >
                ← {previous.title}
              </NavLink>
            ) : (
              <span className="font-mono text-sm text-muted-foreground/50">Start of code</span>
            )}
          </div>
          <div className="sm:text-right">
            {next ? (
              <NavLink
                href={`/aacj/${next.slug}`}
                className="font-mono text-sm text-muted-foreground transition-colors hover:text-crimson"
              >
                {next.title} →
              </NavLink>
            ) : (
              <NavLink
                href="/aac"
                className="font-mono text-sm text-muted-foreground transition-colors hover:text-crimson"
              >
                Army Code →
              </NavLink>
            )}
          </div>
        </nav>
      </article>
    </main>
  );
}

import type { ComponentType } from "react";

import PreambleContent from "./preamble.mdx";
import ArticleIOathContent from "./article-i-oath.mdx";
import ArticleIiConductContent from "./article-ii-conduct.mdx";
import ArticleIiiChainOfCommandContent from "./article-iii-chain-of-command.mdx";
import ArticleIvOperationsContent from "./article-iv-operations.mdx";
import ArticleVCommunicationsContent from "./article-v-communications.mdx";
import ArticleViDisciplineContent from "./article-vi-discipline.mdx";

export type AacArticle = {
  slug: string;
  title: string;
  order: number;
  summary: string;
};

export const aacArticles: AacArticle[] = [
  {
    slug: "preamble",
    title: "Preamble",
    order: 0,
    summary: "Why the code exists and who it binds.",
  },
  {
    slug: "article-i-oath",
    title: "Article I — Oath and Allegiance",
    order: 1,
    summary: "The oath every soldier takes and what it requires in practice.",
  },
  {
    slug: "article-ii-conduct",
    title: "Article II — Conduct and Bearing",
    order: 2,
    summary: "How soldiers carry themselves on duty, off duty, and in public.",
  },
  {
    slug: "article-iii-chain-of-command",
    title: "Article III — Chain of Command",
    order: 3,
    summary: "Authority flows up and orders flow down. No exceptions.",
  },
  {
    slug: "article-iv-operations",
    title: "Article IV — Operational Standards",
    order: 4,
    summary: "Training, deployment, extraction, and the rules of engagement.",
  },
  {
    slug: "article-v-communications",
    title: "Article V — Communications and OPSEC",
    order: 5,
    summary: "What may be spoken, written, or transmitted — and what may not.",
  },
  {
    slug: "article-vi-discipline",
    title: "Article VI — Discipline",
    order: 6,
    summary: "Standards are enforced. Violations are adjudicated under the AACJ.",
  },
];

export const aacSlugs = aacArticles.map((article) => article.slug);

const aacContent = {
  preamble: PreambleContent,
  "article-i-oath": ArticleIOathContent,
  "article-ii-conduct": ArticleIiConductContent,
  "article-iii-chain-of-command": ArticleIiiChainOfCommandContent,
  "article-iv-operations": ArticleIvOperationsContent,
  "article-v-communications": ArticleVCommunicationsContent,
  "article-vi-discipline": ArticleViDisciplineContent,
} satisfies Record<string, ComponentType>;

export type AacSlug = keyof typeof aacContent;

export function getAacArticle(slug: string) {
  return aacArticles.find((article) => article.slug === slug);
}

export function getAacContent(slug: AacSlug): ComponentType;
export function getAacContent(slug: string): ComponentType | undefined;
export function getAacContent(slug: string): ComponentType | undefined {
  return aacContent[slug as AacSlug];
}

export function hasAacContent(slug: string): slug is AacSlug {
  return aacSlugs.includes(slug) && slug in aacContent;
}

export function getAdjacentAacArticles(slug: string) {
  const ordered = [...aacArticles].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex((article) => article.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };

  return {
    previous: index > 0 ? ordered[index - 1] : undefined,
    next: index < ordered.length - 1 ? ordered[index + 1] : undefined,
  };
}

import type { ComponentType } from "react";

import PreambleContent from "./preamble.mdx";
import ArticleIJurisdictionContent from "./article-i-jurisdiction.mdx";
import ArticleIiOffensesContent from "./article-ii-offenses.mdx";
import ArticleIiiInvestigationContent from "./article-iii-investigation.mdx";
import ArticleIvTribunalContent from "./article-iv-tribunal.mdx";
import ArticleVSanctionsContent from "./article-v-sanctions.mdx";
import ArticleViAppealsContent from "./article-vi-appeals.mdx";

export type AacjArticle = {
  slug: string;
  title: string;
  order: number;
  summary: string;
};

export const aacjArticles: AacjArticle[] = [
  {
    slug: "preamble",
    title: "Preamble",
    order: 0,
    summary: "The authority and purpose of military justice within the militia.",
  },
  {
    slug: "article-i-jurisdiction",
    title: "Article I — Jurisdiction",
    order: 1,
    summary: "Who falls under the Code of Justice and when it applies.",
  },
  {
    slug: "article-ii-offenses",
    title: "Article II — Offenses",
    order: 2,
    summary: "Acts that breach the AAC, endanger the unit, or betray the mission.",
  },
  {
    slug: "article-iii-investigation",
    title: "Article III — Investigation and Charges",
    order: 3,
    summary: "How allegations are raised, documented, and brought to tribunal.",
  },
  {
    slug: "article-iv-tribunal",
    title: "Article IV — Tribunal Procedure",
    order: 4,
    summary: "Composition, hearing rules, evidence, and findings.",
  },
  {
    slug: "article-v-sanctions",
    title: "Article V — Sanctions and Discharge",
    order: 5,
    summary: "Penalties from reprimand through dishonorable discharge.",
  },
  {
    slug: "article-vi-appeals",
    title: "Article VI — Appeals",
    order: 6,
    summary: "Review of tribunal findings and final authority.",
  },
];

export const aacjSlugs = aacjArticles.map((article) => article.slug);

const aacjContent = {
  preamble: PreambleContent,
  "article-i-jurisdiction": ArticleIJurisdictionContent,
  "article-ii-offenses": ArticleIiOffensesContent,
  "article-iii-investigation": ArticleIiiInvestigationContent,
  "article-iv-tribunal": ArticleIvTribunalContent,
  "article-v-sanctions": ArticleVSanctionsContent,
  "article-vi-appeals": ArticleViAppealsContent,
} satisfies Record<string, ComponentType>;

export type AacjSlug = keyof typeof aacjContent;

export function getAacjArticle(slug: string) {
  return aacjArticles.find((article) => article.slug === slug);
}

export function getAacjContent(slug: AacjSlug): ComponentType;
export function getAacjContent(slug: string): ComponentType | undefined;
export function getAacjContent(slug: string): ComponentType | undefined {
  return aacjContent[slug as AacjSlug];
}

export function hasAacjContent(slug: string): slug is AacjSlug {
  return aacjSlugs.includes(slug) && slug in aacjContent;
}

export function getAdjacentAacjArticles(slug: string) {
  const ordered = [...aacjArticles].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex((article) => article.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };

  return {
    previous: index > 0 ? ordered[index - 1] : undefined,
    next: index < ordered.length - 1 ? ordered[index + 1] : undefined,
  };
}

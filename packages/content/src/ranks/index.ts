import type { ComponentType } from "react";

import CommanderInChiefContent from "./commander-in-chief.mdx";
import CaptainContent from "./captain.mdx";
import EnlistyContent from "./enlisty.mdx";
import GeneralContent from "./general.mdx";
import RecruitContent from "./recruit.mdx";
import SergeantContent from "./sergeant.mdx";

export type Rank = {
  slug: string;
  title: string;
  order: number;
  insignia: string;
  summary: string;
  equalRank?: string;
  holder?: string;
};

export const ranks: Rank[] = [
  {
    slug: "enlisty",
    title: "Enlisty",
    order: 1,
    insignia: "◇",
    summary: "Came through the enlistment form. Same day-one standing as recruit.",
    equalRank: "recruit",
  },
  {
    slug: "recruit",
    title: "Recruit",
    order: 1,
    insignia: "◇",
    summary: "Brought in by a sponsor already in the unit.",
    equalRank: "enlisty",
  },
  {
    slug: "sergeant",
    title: "Sergeant",
    order: 2,
    insignia: "◆",
    summary: "Leads a squad in the field. Trusted to hold a position and keep people alive.",
  },
  {
    slug: "captain",
    title: "Captain",
    order: 3,
    insignia: "★",
    summary: "Owns an operation end to end — planning, execution, and extraction.",
  },
  {
    slug: "general",
    title: "General",
    order: 4,
    insignia: "★★",
    summary: "Commands theater-level operations across multiple units and regions.",
  },
  {
    slug: "commander-in-chief",
    title: "Commander in Chief",
    order: 5,
    insignia: "⚑",
    summary: "Final authority over the militia. One holder.",
    holder: "AWFixer",
  },
];

export const rankSlugs = ranks.map((rank) => rank.slug);

const rankContent = {
  enlisty: EnlistyContent,
  recruit: RecruitContent,
  sergeant: SergeantContent,
  captain: CaptainContent,
  general: GeneralContent,
  "commander-in-chief": CommanderInChiefContent,
} satisfies Record<string, ComponentType>;

export type RankSlug = keyof typeof rankContent;

export function getRank(slug: string) {
  return ranks.find((rank) => rank.slug === slug);
}

export function getRankContent(slug: RankSlug): ComponentType;
export function getRankContent(slug: string): ComponentType | undefined;
export function getRankContent(slug: string): ComponentType | undefined {
  return rankContent[slug as RankSlug];
}

export function hasRankContent(slug: string): slug is RankSlug {
  return rankSlugs.includes(slug) && slug in rankContent;
}

export function getAdjacentRanks(slug: string) {
  const ordered = [...ranks].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  const index = ordered.findIndex((rank) => rank.slug === slug);
  if (index === -1) return { previous: undefined, next: undefined };

  const uniqueOrders = [...new Set(ordered.map((rank) => rank.order))];
  const currentOrder = ordered[index]!.order;
  const orderIndex = uniqueOrders.indexOf(currentOrder);

  const findByOrder = (order: number) => ordered.find((rank) => rank.order === order);

  return {
    previous: orderIndex > 0 ? findByOrder(uniqueOrders[orderIndex - 1]!) : undefined,
    next:
      orderIndex < uniqueOrders.length - 1 ? findByOrder(uniqueOrders[orderIndex + 1]!) : undefined,
  };
}

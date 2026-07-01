"use client";

import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { portfolioCompanies, type PortfolioCompany } from "@/lib/portfolio";

type PortfolioGridProps = {
  companies?: PortfolioCompany[];
  showRole?: boolean;
};

export function PortfolioGrid({ companies = portfolioCompanies, showRole = false }: PortfolioGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {companies.map((item, i) => {
        const external = item.external ?? item.href.startsWith("http");
        return (
          <Reveal key={item.name} delay={0.04 * (i % 6)}>
            <a
              href={item.href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : undefined)}
              className="panel-steel group flex h-full flex-col gap-3 rounded-2xl p-7 transition-colors hover:border-steel-bright/25"
            >
              <div className="flex items-start justify-between gap-4">
                <item.icon className="h-5 w-5 shrink-0 text-steel-bright" strokeWidth={1.5} />
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-off-white" />
              </div>
              <h3 className="font-display text-lg text-off-white">{item.name}</h3>
              {showRole && item.role ? (
                <p className="font-mono text-[10px] tracking-widest text-steel-bright/80 uppercase">
                  {item.role}
                </p>
              ) : null}
              <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </a>
          </Reveal>
        );
      })}
    </div>
  );
}
"use client";

import { cn } from "@awfixersites/ui/lib/utils";

export type FormProgressSection = {
  id: string;
  label: string;
};

type FormProgressProps = {
  sections: readonly FormProgressSection[];
  sectionIndex: number;
  stepInSection: number;
  stepsInSection: number;
};

export function FormProgress({
  sections,
  sectionIndex,
  stepInSection,
  stepsInSection,
}: FormProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {sections.map((section, index) => {
          const isComplete = index < sectionIndex;
          const isCurrent = index === sectionIndex;

          return (
            <div key={section.id} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 items-center justify-center border font-mono text-[0.65rem]",
                  isComplete && "border-crimson/60 bg-crimson/20 text-crimson",
                  isCurrent && "border-crimson bg-crimson text-primary-foreground",
                  !isComplete && !isCurrent && "border-border/50 text-muted-foreground",
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "font-mono text-[0.65rem] tracking-[0.14em] uppercase",
                  isCurrent ? "text-bleach" : "text-muted-foreground",
                )}
              >
                {section.label}
              </span>
              {index < sections.length - 1 ? (
                <span className="hidden h-px w-6 bg-border/40 sm:block" aria-hidden />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 h-1 w-full bg-border/30">
        <div
          className="h-full bg-crimson transition-all duration-300"
          style={{
            width: `${((sectionIndex + stepInSection / Math.max(stepsInSection, 1)) / sections.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

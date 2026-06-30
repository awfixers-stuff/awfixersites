"use client";

import { Button } from "@awfixersites/ui/components/button";

type RejectionPanelProps = {
  label?: string;
  title: string;
  body: string;
  footnote?: string;
  backLabel?: string;
  restartLabel?: string;
  onBack: () => void;
  onRestart: () => void;
};

export function RejectionPanel({
  label = "Application halted",
  title,
  body,
  footnote,
  backLabel = "Back",
  restartLabel = "Start over",
  onBack,
  onRestart,
}: RejectionPanelProps) {
  return (
    <div className="border border-destructive/40 bg-destructive/5 p-6 sm:p-8">
      <p className="font-mono text-[0.65rem] tracking-[0.18em] text-destructive uppercase">
        {label}
      </p>
      <h2 className="font-display mt-3 text-2xl font-bold tracking-tight text-bleach uppercase sm:text-3xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{body}</p>
      {footnote ? (
        <p className="mt-3 border-l-2 border-navy/80 pl-4 text-sm leading-relaxed text-bleach/80">
          {footnote}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onBack} className="font-mono">
          {backLabel}
        </Button>
        <Button type="button" onClick={onRestart} className="font-mono">
          {restartLabel}
        </Button>
      </div>
    </div>
  );
}

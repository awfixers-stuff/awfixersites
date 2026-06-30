"use client";

import { CheckIcon } from "lucide-react";

import { cn } from "@awfixersites/ui/lib/utils";

type ChoiceCardProps = {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description?: string;
  className?: string;
};

export function ChoiceCard({ selected, onSelect, title, description, className }: ChoiceCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative w-full border px-4 py-4 text-left transition-colors",
        "border-border/50 bg-black/40 hover:border-crimson/40 hover:bg-crimson/5",
        selected && "border-crimson/70 bg-crimson/10 shadow-[inset_0_0_0_1px_rgba(220,20,60,0.25)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm text-bleach">{title}</p>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "flex size-5 shrink-0 items-center justify-center border border-border/60 transition-colors",
            selected && "border-crimson bg-crimson text-primary-foreground",
          )}
        >
          {selected ? <CheckIcon className="size-3" /> : null}
        </span>
      </div>
    </button>
  );
}

type YesNoChoiceProps = {
  value: boolean | null;
  onChange: (value: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
  error?: string;
};

export function YesNoChoice({
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No",
  error,
}: YesNoChoiceProps) {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ChoiceCard selected={value === true} onSelect={() => onChange(true)} title={yesLabel} />
        <ChoiceCard selected={value === false} onSelect={() => onChange(false)} title={noLabel} />
      </div>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

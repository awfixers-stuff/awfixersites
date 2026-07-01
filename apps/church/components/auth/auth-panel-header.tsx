import { ChurchIcon } from "@/components/church-icon";

type AuthPanelHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function AuthPanelHeader({ eyebrow, title, description }: AuthPanelHeaderProps) {
  return (
    <div className="space-y-6 text-center">
      <ChurchIcon className="mx-auto w-20 text-foreground/80 sm:w-24" />

      <div className="inline-flex items-center gap-2 text-xs font-mono text-foreground/40 uppercase tracking-widest">
        <span className="w-6 h-px bg-foreground/20" />
        {eyebrow}
        <span className="w-6 h-px bg-foreground/20" />
      </div>

      <div className="space-y-4">
        <h1 className="font-display text-4xl font-bold tracking-tight leading-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto max-w-lg text-base leading-relaxed text-foreground/60 sm:text-lg">
          {description}
        </p>
      </div>
    </div>
  );
}

import { cn } from "@awfixersites/ui/lib/utils";

type PageIntroProps = {
  label?: string;
  title: string;
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "center";
};

export function PageIntro({ label, title, children, className, align = "left" }: PageIntroProps) {
  return (
    <header className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {label ? (
        <p className="font-mono text-[0.7rem] font-medium tracking-[0.2em] text-crimson uppercase">
          {label}
        </p>
      ) : null}
      <h1 className="font-display mt-2 text-4xl font-bold tracking-tight text-bleach uppercase sm:text-5xl lg:text-6xl">
        {title}
      </h1>
      <div className={cn("stripe-rule mt-5 max-w-[7rem]", align === "center" && "mx-auto")} />
      {children ? (
        <div className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {children}
        </div>
      ) : null}
    </header>
  );
}

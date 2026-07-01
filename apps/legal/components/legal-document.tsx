import { CLink as Link } from "@awfixersites/telemetry/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  children: React.ReactNode;
  className?: string;
};

export function LegalDocument({
  eyebrow,
  title,
  description,
  lastUpdated,
  children,
  className,
}: LegalDocumentProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <section className="relative overflow-hidden px-6 pt-28 pb-16 lg:pt-36 lg:pb-20">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="mb-4 font-mono text-[10px] tracking-[0.4em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
          <h1 className="font-display text-4xl leading-tight text-off-white lg:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </section>

      <section className="section-auto px-6 pb-28 lg:pb-36">
        <div className="mx-auto max-w-3xl">
          <p className="mb-10 font-mono text-xs text-muted-foreground/80">
            Last updated: {lastUpdated}
          </p>
          <div>{children}</div>
          <div className="mt-16 border-t border-glass-border pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:text-off-white"
            >
              <ArrowLeft className="h-4 w-4" />
              All legal documents
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

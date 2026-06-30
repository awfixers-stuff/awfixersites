import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@awfixersites/ui/lib/utils";

export function MdxH1({ className, ...props }: ComponentPropsWithoutRef<"h1">) {
  return (
    <h1
      className={cn(
        "font-display mt-10 mb-4 text-3xl font-bold tracking-tight text-bleach uppercase first:mt-0 sm:text-4xl",
        className,
      )}
      {...props}
    />
  );
}

export function MdxH2({ className, ...props }: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className={cn(
        "font-display mt-10 mb-3 text-xl font-semibold tracking-tight text-bleach uppercase sm:text-2xl",
        className,
      )}
      {...props}
    />
  );
}

export function MdxH3({ className, ...props }: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      className={cn(
        "mt-6 mb-2 font-mono text-sm font-semibold tracking-wide text-bleach uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function MdxP({ className, ...props }: ComponentPropsWithoutRef<"p">) {
  return <p className={cn("mb-4 leading-7 text-bleach/90", className)} {...props} />;
}

export function MdxA({ className, ...props }: ComponentPropsWithoutRef<"a">) {
  return (
    <a
      className={cn(
        "font-medium text-crimson underline decoration-crimson/50 underline-offset-4 transition-colors hover:text-bleach hover:decoration-bleach",
        className,
      )}
      {...props}
    />
  );
}

export function MdxUl({ className, ...props }: ComponentPropsWithoutRef<"ul">) {
  return (
    <ul className={cn("mb-4 list-disc space-y-1 pl-6 text-bleach/90", className)} {...props} />
  );
}

export function MdxOl({ className, ...props }: ComponentPropsWithoutRef<"ol">) {
  return (
    <ol className={cn("mb-4 list-decimal space-y-1 pl-6 text-bleach/90", className)} {...props} />
  );
}

export function MdxLi({ className, ...props }: ComponentPropsWithoutRef<"li">) {
  return <li className={cn("leading-7", className)} {...props} />;
}

export function MdxBlockquote({ className, ...props }: ComponentPropsWithoutRef<"blockquote">) {
  return (
    <blockquote
      className={cn(
        "mb-4 border-l-2 border-crimson py-1 pr-4 pl-4 text-bleach/85 not-italic",
        className,
      )}
      {...props}
    />
  );
}

export function MdxHr({ className, ...props }: ComponentPropsWithoutRef<"hr">) {
  return <hr className={cn("my-8 border-navy/50", className)} {...props} />;
}

export function MdxCode({ className, ...props }: ComponentPropsWithoutRef<"code">) {
  return (
    <code
      className={cn("rounded bg-navy/20 px-1.5 py-0.5 font-mono text-sm text-bleach", className)}
      {...props}
    />
  );
}

export function MdxPre({ className, ...props }: ComponentPropsWithoutRef<"pre">) {
  return (
    <pre
      className={cn(
        "mb-4 overflow-x-auto rounded border border-navy/50 bg-black p-4 font-mono text-sm text-bleach",
        className,
      )}
      {...props}
    />
  );
}

export function MdxTable({ className, ...props }: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="mb-4 w-full overflow-x-auto">
      <table
        className={cn("w-full border-collapse text-left text-sm text-bleach/90", className)}
        {...props}
      />
    </div>
  );
}

export function MdxThead({ className, ...props }: ComponentPropsWithoutRef<"thead">) {
  return (
    <thead
      className={cn(
        "border-b border-border/60 font-mono text-[0.7rem] tracking-[0.12em] text-muted-foreground uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function MdxTbody({ className, ...props }: ComponentPropsWithoutRef<"tbody">) {
  return <tbody className={cn("divide-y divide-navy/30", className)} {...props} />;
}

export function MdxTr({ className, ...props }: ComponentPropsWithoutRef<"tr">) {
  return <tr className={cn("transition-colors hover:bg-navy/10", className)} {...props} />;
}

export function MdxTh({ className, ...props }: ComponentPropsWithoutRef<"th">) {
  return <th className={cn("px-4 py-3 font-medium", className)} {...props} />;
}

export function MdxTd({ className, ...props }: ComponentPropsWithoutRef<"td">) {
  return <td className={cn("px-4 py-3", className)} {...props} />;
}

export function MdxStrong({ className, ...props }: ComponentPropsWithoutRef<"strong">) {
  return <strong className={cn("font-semibold text-bleach", className)} {...props} />;
}

export function MdxEm({ className, ...props }: ComponentPropsWithoutRef<"em">) {
  return <em className={cn("text-bleach italic", className)} {...props} />;
}

export function MdxLead({ className, children, ...props }: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      className={cn("mb-6 text-xl leading-8 font-light text-bleach/80 sm:text-2xl", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function MdxBadge({ className, children, ...props }: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border border-navy bg-navy/20 px-2 py-0.5 font-mono text-xs font-medium text-bleach",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function MdxAlert({ className, children, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "mb-4 rounded border-l-4 border-crimson bg-navy/10 p-4 text-bleach/90",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function MdxCard({ className, children, ...props }: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("rounded border border-navy/50 bg-black p-5 shadow-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}

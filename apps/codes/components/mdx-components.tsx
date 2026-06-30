"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { cn } from "@awfixersites/ui/lib/utils";

interface MdxComponentsProps {
  children?: React.ReactNode;
}

export function MdxComponents({ children }: MdxComponentsProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert prose-headings:scroll-mt-20 prose-headings:font-bold lg:prose-lg max-w-none">
      {children}
    </div>
  );
}

// Custom MDX components for enhanced styling
export const mdxComponents = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        "scroll-mt-20 text-4xl font-bold tracking-tight text-foreground",
        "border-b border-border pb-2 mb-4",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        "scroll-mt-16 text-3xl font-bold tracking-tight text-foreground",
        "border-b border-border pb-2 mb-4 mt-8",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        "scroll-mt-12 text-2xl font-bold tracking-tight text-foreground",
        "mt-6 mb-3",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className={cn(
        "scroll-mt-12 text-xl font-bold tracking-tight text-foreground",
        "mt-6 mb-2",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("leading-7 text-muted-foreground mb-4", className)} {...props} />
  ),
  a: ({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = props.href?.startsWith("http");
    const Component = isExternal ? "a" : Link;

    return (
      <Component
        href={props.href || ""}
        className={cn(
          "font-medium text-primary underline decoration-primary/30 underline-offset-4",
          "transition-colors hover:text-primary/80",
          "inline-flex items-center gap-1",
          className,
        )}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        {...props}
      >
        {props.children}
        {isExternal && <ExternalLink className="h-3 w-3" />}
      </Component>
    );
  },
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        "border-l-4 border-primary/50 pl-4 italic",
        "my-6 mx-0 bg-muted/50 py-2 pr-4 rounded-r-md",
        "text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem]",
        "font-mono text-sm font-semibold",
        "text-primary",
        "before:absolute before:inset-0 before:-z-10 before:bg-primary/10",
        "before:rounded before:blur-[2px]",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className={cn(
        "relative overflow-x-auto rounded-lg border bg-foreground",
        "p-4 my-6",
        className,
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-y-auto">
      <table
        className={cn(
          "w-full caption-bottom text-sm",
          "border-separate border-spacing-0",
          className,
        )}
        {...props}
      />
    </div>
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn(
        "border border-border px-4 py-3 text-left",
        "font-bold text-foreground",
        "bg-muted/50",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn(
        "border border-border px-4 py-3 text-foreground",
        "[tbody>tr:nth-child(odd)_&]:bg-muted/30",
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("my-4 ml-6 list-disc [&>li]:mt-2", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn("my-4 ml-6 list-decimal [&>li]:mt-2", className)} {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn("leading-relaxed", className)} {...props} />
  ),
  hr: ({ ...props }) => <hr className="my-8 border-border" {...props} />,
};

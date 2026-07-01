import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";

import { useMDXComponents as useBaseMDXComponents } from "@awfixersites/mdx/components";
import { cn } from "@/lib/utils";

export function useMDXComponents(components: MDXComponents = {}): MDXComponents {
  const base = useBaseMDXComponents(components);

  return {
    ...base,
    h1: ({ className, ...props }: ComponentPropsWithoutRef<"h1">) => (
      <h1
        className={cn(
          "font-display mb-6 text-4xl leading-tight text-off-white lg:text-5xl",
          className,
        )}
        {...props}
      />
    ),
    h2: ({ className, ...props }: ComponentPropsWithoutRef<"h2">) => (
      <h2
        className={cn(
          "font-display mt-12 mb-4 text-xl tracking-tight text-off-white first:mt-0 lg:text-2xl",
          className,
        )}
        {...props}
      />
    ),
    p: ({ className, ...props }: ComponentPropsWithoutRef<"p">) => (
      <p className={cn("mb-4 leading-relaxed text-muted-foreground", className)} {...props} />
    ),
    a: ({ className, ...props }: ComponentPropsWithoutRef<"a">) => (
      <a
        className={cn(
          "text-off-white underline decoration-steel-bright/40 underline-offset-4 transition-colors hover:text-steel-bright",
          className,
        )}
        {...props}
      />
    ),
    li: ({ className, ...props }: ComponentPropsWithoutRef<"li">) => (
      <li className={cn("leading-relaxed text-muted-foreground", className)} {...props} />
    ),
    ul: ({ className, ...props }: ComponentPropsWithoutRef<"ul">) => (
      <ul className={cn("mb-4 list-disc space-y-2 pl-6", className)} {...props} />
    ),
  };
}

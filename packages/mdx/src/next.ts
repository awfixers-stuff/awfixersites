import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const defaultPageExtensions = ["js", "jsx", "ts", "tsx", "md", "mdx"];

export function withMdx(config: NextConfig = {}): NextConfig {
  const withMDX = createMDX({
    options: {
      remarkPlugins: ["remark-gfm"],
      rehypePlugins: [],
    },
  });

  return withMDX({
    ...config,
    pageExtensions: config.pageExtensions ?? defaultPageExtensions,
    transpilePackages: ["@awfixersites/content", ...(config.transpilePackages ?? [])],
  });
}

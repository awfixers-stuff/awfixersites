import { withMdx } from "@awfixersites/mdx/next";

export default withMdx({
  transpilePackages: [
    "@awfixersites/ui",
    "@awfixersites/auth",
    "@awfixersites/db",
    "@awfixersites/content",
  ],
});

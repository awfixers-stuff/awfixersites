import { withBotId } from "botid/next/config";
import { withMdx } from "@awfixersites/mdx/next";

export default withBotId(
  withMdx({
    transpilePackages: [
      "@awfixersites/telemetry",
      "@awfixersites/ui",
      "@awfixersites/auth",
      "@awfixersites/db",
      "@awfixersites/content",
    ],
  }),
);

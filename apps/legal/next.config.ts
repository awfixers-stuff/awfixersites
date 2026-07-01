import { withAppUtils } from "@awfixersites/utils/next-config";
import { withBotId } from "botid/next/config";
import { withMdx } from "@awfixersites/mdx/next";

export default withAppUtils(withBotId(
  withMdx({
    transpilePackages: ["@awfixersites/security", "@awfixersites/utils", "@awfixersites/telemetry", "@awfixersites/ui", "@awfixersites/auth"],
  }),
));
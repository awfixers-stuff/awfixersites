import { withAppUtils } from "@awfixersites/utils/next-config";
import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@awfixersites/api-handlers",
    "@awfixersites/auth",
    "@awfixersites/db",
    "@awfixersites/links",
    "@awfixersites/security",
    "@awfixersites/telemetry",
    "@awfixersites/ui",
    "@awfixersites/utils",
  ],
};

export default withAppUtils(withBotId(nextConfig));
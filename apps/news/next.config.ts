import { withAppUtils } from "@awfixersites/utils/next-config";
import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@awfixersites/security", "@awfixersites/utils", "@awfixersites/telemetry", "@awfixersites/ui", "@awfixersites/auth"],
};

export default withAppUtils(withBotId(nextConfig));
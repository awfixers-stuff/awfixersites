import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@awfixersites/telemetry", "@awfixersites/ui", "@awfixersites/auth"],
};

export default withBotId(nextConfig);

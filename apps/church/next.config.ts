import { withAppUtils } from "@awfixersites/utils/next-config";
import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@awfixersites/security", "@awfixersites/utils", "@awfixersites/telemetry", "@awfixersites/ui", "@awfixersites/auth"],
  async redirects() {
    return [
      {
        source: "/jobs",
        destination: "https://careers.awfixer.llc",
        permanent: true,
      },
      {
        source: "/donate",
        destination: "https://donate.awfixer.church",
        permanent: true,
      },
      {
        source: "/donations",
        destination: "https://donate.awfixer.church",
        permanent: true,
      },
    ];
  },
};

export default withAppUtils(withBotId(nextConfig));
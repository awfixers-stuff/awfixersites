import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@awfixersites/ui", "@awfixersites/db", "@awfixersites/auth"],
};

export default nextConfig;

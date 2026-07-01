import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@awfixersites/ui", "@awfixersites/auth"],
  async redirects() {
    return [
      {
        source: "/jobs",
        destination: "https://careers.awfixer.llc",
        permanent: true,
      },
      {
        source: "/donate",
        destination: "/donations",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

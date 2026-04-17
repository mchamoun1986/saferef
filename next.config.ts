import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/configurator',
        destination: '/calculator',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

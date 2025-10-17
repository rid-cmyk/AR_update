import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack caching in development to avoid permission issues
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;

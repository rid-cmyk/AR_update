import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack caching in development to avoid permission issues
      config.cache = false;
    }
    
    // Suppress Ant Design React 19 compatibility warnings
    config.ignoreWarnings = [
      /antd.*compatible/,
      /React.*16.*18/,
    ];
    
    return config;
  },
  // Additional logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default nextConfig;

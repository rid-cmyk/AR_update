import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  experimental: {
    optimizePackageImports: [
      "antd",
      "@ant-design/icons",
      "recharts",
      "lucide-react",
      "date-fns",
      "dayjs",
      "lodash",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      /antd.*compatible/,
      /React.*16.*18/,
    ];
    
    return config;
  },
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
};

export default nextConfig;

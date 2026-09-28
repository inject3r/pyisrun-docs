import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  distDir: "out",
  basePath: "/pylsrun",
  assetPrefix: "/pylsrun",
};

export default nextConfig;

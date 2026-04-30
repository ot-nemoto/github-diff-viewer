import type { NextConfig } from "next";

const isStatic = process.env.BUILD_MODE === "static";

const nextConfig: NextConfig = {
  ...(isStatic && {
    output: "export",
    basePath: "/github-diff",
    assetPrefix: "/github-diff",
    trailingSlash: true,
    images: { unoptimized: true },
  }),
};

export default nextConfig;

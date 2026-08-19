import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pure front-end: `bun run build` emits a fully static site into ./out
  // with no Node server required.
  output: "export",
  images: { unoptimized: true },
  devIndicators: false,
};

export default nextConfig;

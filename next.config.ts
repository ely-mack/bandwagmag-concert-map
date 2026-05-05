import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "static.tixr.com" },
      { protocol: "https", hostname: "cdn.tixr.com" },
      { protocol: "https", hostname: "images.sk-static.com" },
    ],
  },
};

export default nextConfig;

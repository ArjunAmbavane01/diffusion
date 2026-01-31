import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      },
      {
        protocol: "https",
        hostname: "neighborly-porcupine-134.convex.cloud"
      },
      {
        protocol: "https",
        hostname: "moonlit-bloodhound-827.convex.cloud"
      }
    ]
  },
};

export default nextConfig;

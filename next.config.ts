import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: { serverActions: { allowedOrigins: ["*"] } },
  images: { domains: ["avatar.vercel.sh"] },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Week 10: lets the access guard call forbidden(), which shows app/forbidden.tsx with status 403.
    authInterrupts: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Client routes are exported as static assets; the separate Hono Worker owns auth and sync.
  output: "export",
};

export default nextConfig;

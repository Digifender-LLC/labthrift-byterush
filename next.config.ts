import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ByteRush/Tech Dose is a fully client-side app (localStorage only, no
  // server routes, no server actions, no cookies). A static export lets us
  // ship it to Cloudflare Workers as plain static assets with no adapter or
  // Node runtime required.
  output: "export",
};

export default nextConfig;

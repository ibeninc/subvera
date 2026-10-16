import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Keep the dev badge clear of the sidebar's account row.
  devIndicators: { position: "bottom-right" },
  partialPrefetching: true,
  // Overview, Documents and Reports were folded into Reviews and Archive.
  async redirects() {
    return [
      { source: "/dashboard", destination: "/reviews", permanent: false },
      { source: "/documents", destination: "/reviews", permanent: false },
      { source: "/reports", destination: "/archive", permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

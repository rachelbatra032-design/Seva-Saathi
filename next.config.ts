import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Dev uses `.next`; CI/e2e set NEXT_DIST_DIR so builds never clobber the dev cache. */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
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

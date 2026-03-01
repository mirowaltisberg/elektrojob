import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),

  experimental: {
    // Tree-shake icon/analytics packages — eliminates unused JS (24 KiB savings)
    optimizePackageImports: ["lucide-react", "@vercel/analytics", "radix-ui"],
  },

  // SEO-DECISION: Prevent search engines from indexing API responses
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";
import path from "path";

// Admin API base URL — uploaded images live in the admin app's public folder,
// so the frontend proxies /uploads/* to the admin to avoid broken images.
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:3001";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/django/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
      // Proxy uploaded images from the admin app so they render on the blog too
      // (all folders allowed by the admin upload API)
      {
        source: "/:folder(uploads|posts|images|logos)/:path*",
        destination: `${ADMIN_API_URL}/:folder/:path*`,
      },
    ];
  },
};

export default nextConfig;
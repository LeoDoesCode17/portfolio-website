import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*", //source url
        destination: "http://fastapi:8000/:path*",  // container-to-container
      },
    ]
  }
};

export default nextConfig;

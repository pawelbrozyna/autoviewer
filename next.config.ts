import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/tax-mileage",
        destination: "/mileage-check",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;

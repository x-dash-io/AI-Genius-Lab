import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
    cacheComponents: true,
  },
  // Disable React strict mode warnings in dev (optional, helps reduce noise)
  reactStrictMode: true,
  // Speed up builds by skipping type checking (Vercel runs it separately)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

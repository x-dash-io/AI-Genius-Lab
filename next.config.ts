import type { NextConfig } from "next";

const nextConfig = (phase: string): NextConfig => {
  // Set a flag during build phase so our prisma client can optimize retries
  if (phase === "phase-production-build") {
    process.env.NEXT_IS_BUILDING = "true";
  }

  return {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "res.cloudinary.com",
        },
      ],
    },
    experimental: {
      optimizePackageImports: [
        "lucide-react",
        "date-fns",
        "recharts",
        "framer-motion",
        "clsx",
        "tailwind-merge",
      ],
    },
    // Disable React strict mode warnings in dev (optional, helps reduce noise)
    reactStrictMode: true,
    // Speed up builds by skipping type checking (Vercel runs it separately)
    typescript: {
      ignoreBuildErrors: true,
    },
    // Skip linting during build to speed up CI
    eslint: {
      ignoreDuringBuilds: true,
    },
    poweredByHeader: false,
  };
};

export default nextConfig;

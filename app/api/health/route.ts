import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Health check endpoint for load balancer and monitoring
 * Returns 200 if the service is healthy, 503 if there are issues
 */
export async function GET() {
  const health = {
    status: "healthy" as "healthy" | "unhealthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    checks: {
      database: false,
    },
    uptime: process.uptime(),
  };

  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = true;
  } catch (error) {
    console.error("Health check - Database error:", error);
    health.status = "unhealthy";
  }

  // Determine if any checks failed
  const allHealthy = Object.values(health.checks).every((check) => check === true);
  
  if (!allHealthy) {
    health.status = "unhealthy";
  }

  return NextResponse.json(health, {
    status: health.status === "healthy" ? 200 : 503,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}

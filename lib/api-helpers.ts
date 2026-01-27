/**
 * API helper utilities for consistent error handling, rate limiting, and validation
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { rateLimits } from "@/lib/rate-limit";
import { AppError, createErrorResponse } from "@/lib/errors";

/**
 * Standardized error response format
 */
export interface StandardErrorResponse {
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

/**
 * Create standardized error response
 */
export function createStandardErrorResponse(
  error: unknown,
  defaultMessage = "An error occurred"
): NextResponse<StandardErrorResponse> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          message: error.userMessage || error.message,
          code: error.code,
          details: process.env.NODE_ENV === "development" ? error.message : undefined,
        },
      },
      { status: error.statusCode }
    );
  }

  const { message, statusCode, userMessage } = handleServerError(error);
  return NextResponse.json(
    {
      error: {
        message: userMessage || defaultMessage,
        code: message,
        details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined,
      },
    },
    { status: statusCode }
  );
}

/**
 * Handle server errors consistently
 */
function handleServerError(error: unknown): {
  message: string;
  statusCode: number;
  userMessage: string;
} {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      userMessage: error.userMessage || error.message,
    };
  }

  if (error instanceof Error) {
    const msg = error.message;
    if (msg === "UNAUTHORIZED" || msg.startsWith("UNAUTHORIZED:")) {
      return {
        message: "Unauthorized",
        statusCode: 401,
        userMessage: msg.includes(":") ? msg.split(":").slice(1).join(":").trim() : "Please sign in to continue",
      };
    }

    if (msg === "FORBIDDEN" || msg.startsWith("FORBIDDEN:")) {
      return {
        message: "Forbidden",
        statusCode: 403,
        userMessage: msg.includes(":") ? msg.split(":").slice(1).join(":").trim() : "You don't have permission to perform this action",
      };
    }

    if (msg === "NOT_FOUND" || msg.startsWith("NOT_FOUND:")) {
      return {
        message: "Not Found",
        statusCode: 404,
        userMessage: msg.includes(":") ? msg.split(":").slice(1).join(":").trim() : "The requested resource was not found",
      };
    }
  }

  return {
    message: "Internal Server Error",
    statusCode: 500,
    userMessage: "An unexpected error occurred. Please try again.",
  };
}

/**
 * Rate limit check helper
 */
export async function checkRateLimit(
  request: NextRequest,
  limitType: "api" | "auth" | "upload" | "review" = "api"
): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  // Use user ID if authenticated, otherwise use IP
  const identifier = session?.user?.id || 
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous";

  const rateLimit = await rateLimits[limitType](identifier);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          message: "Rate limit exceeded. Please try again later.",
          code: "RATE_LIMITED",
        },
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "100",
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": new Date(rateLimit.resetAt).toISOString(),
          "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}

/**
 * Require authentication helper
 */
export async function requireAuth(): Promise<{ id: string; email: string; role: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw AppError.unauthorized();
  }
  return {
    id: session.user.id,
    email: session.user.email!,
    role: session.user.role || "customer",
  };
}

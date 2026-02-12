import { handleServerError } from "@/lib/errors";
import { NextResponse } from "next/server";

/**
 * Wrapper for API route handlers with error handling
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<Response | NextResponse>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error: unknown) {
      const maybeError = error as { digest?: string; message?: string };
      // Re-throw Next.js internal errors used for bailing out of prerendering
      if (
        maybeError.digest?.includes("NEXT_PRERENDER_INTERRUPTED") ||
        maybeError.digest?.includes("DYNAMIC_SERVER_USAGE") ||
        maybeError.message?.includes("headers()") ||
        maybeError.message?.includes("cookies()") ||
        maybeError.message?.includes("getServerSession") ||
        maybeError.message?.includes("redirect()") ||
        maybeError.message?.includes("notFound()")
      ) {
        throw error;
      }

      const { message, statusCode, userMessage } = handleServerError(error);
      return NextResponse.json(
        { error: userMessage, code: message },
        { status: statusCode }
      );
    }
  };
}

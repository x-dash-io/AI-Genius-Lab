import { handleServerError } from "@/lib/errors";
import { NextResponse } from "next/server";

/**
 * Wrapper for API route handlers with error handling
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<Response | NextResponse>
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      const { message, statusCode, userMessage } = handleServerError(error);
      return NextResponse.json(
        { error: userMessage, code: message },
        { status: statusCode }
      );
    }
  };
}

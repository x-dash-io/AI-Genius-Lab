/**
 * Centralized error handling utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public userMessage?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleServerError(error: unknown): {
  message: string;
  statusCode: number;
  userMessage: string;
} {
  console.error("Server error:", error);

  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      userMessage: error.userMessage || error.message,
    };
  }

  if (error instanceof Error) {
    // Handle known error messages
    if (error.message === "UNAUTHORIZED") {
      return {
        message: "Unauthorized",
        statusCode: 401,
        userMessage: "Please sign in to continue",
      };
    }

    if (error.message === "FORBIDDEN") {
      return {
        message: "Forbidden",
        statusCode: 403,
        userMessage: "You don't have permission to perform this action",
      };
    }

    if (error.message === "NOT_FOUND") {
      return {
        message: "Not Found",
        statusCode: 404,
        userMessage: "The requested resource was not found",
      };
    }

    return {
      message: error.message,
      statusCode: 500,
      userMessage: "An unexpected error occurred. Please try again.",
    };
  }

  return {
    message: "Unknown error",
    statusCode: 500,
    userMessage: "An unexpected error occurred. Please try again.",
  };
}

export function createErrorResponse(error: unknown) {
  const { message, statusCode, userMessage } = handleServerError(error);
  return Response.json({ error: userMessage, code: message }, { status: statusCode });
}

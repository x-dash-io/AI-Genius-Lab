/**
 * Structured logging utility
 * Replaces console.log/error/warn with structured logging
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private isProduction = process.env.NODE_ENV === "production";

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const formatted = this.formatMessage(level, message, context);

    // In production, only log errors and warnings
    if (this.isProduction && (level === "debug" || (level === "info" && !error))) {
      return;
    }

    // Add error stack if available
    const logContext = error
      ? { ...context, error: error.message, stack: error.stack }
      : context;

    switch (level) {
      case "debug":
        if (this.isDevelopment) {
          console.debug(formatted, logContext || "");
        }
        break;
      case "info":
        console.info(formatted, logContext || "");
        break;
      case "warn":
        console.warn(formatted, logContext || "");
        // In production, could send to error tracking service
        break;
      case "error":
        console.error(formatted, logContext || "");
        // In production, send to error tracking service (e.g., Sentry)
        if (this.isProduction && error) {
          // Example: Sentry.captureException(error, { extra: context });
        }
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    this.log("warn", message, context, error);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log("error", message, context, error);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export function logDebug(message: string, context?: LogContext): void {
  logger.debug(message, context);
}

export function logInfo(message: string, context?: LogContext): void {
  logger.info(message, context);
}

export function logWarn(message: string, context?: LogContext, error?: Error): void {
  logger.warn(message, context, error);
}

export function logError(message: string, context?: LogContext, error?: Error): void {
  logger.error(message, context, error);
}

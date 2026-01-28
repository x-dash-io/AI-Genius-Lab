import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Prisma Client singleton with optimized connection settings for Neon serverless
 * 
 * For serverless environments (Vercel with Neon), we need to:
 * 1. Reuse connections via global singleton
 * 2. Use the connection pooler endpoint (-pooler in hostname)
 * 3. Reduce connection pool size
 * 
 * DATABASE_URL should include:
 * ?pgbouncer=true&connect_timeout=15&pool_timeout=15
 */
function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Execute a database operation with automatic retry on connection errors
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Check for common transient database or network errors
      const errorMessage = lastError.message || "";
      const isConnectionError = 
        errorMessage.includes("connection pool") ||
        errorMessage.includes("P2024") ||
        errorMessage.includes("Timed out") ||
        errorMessage.includes("socket hang up") ||
        errorMessage.includes("ECONNRESET") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("EOF") ||
        errorMessage.includes("closed") ||
        errorMessage.includes("interrupted");
      
      if (!isConnectionError || attempt === maxRetries) {
        throw lastError;
      }
      
      console.warn(`Database connection retry ${attempt}/${maxRetries} after ${delayMs}ms`);
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  throw lastError;
}

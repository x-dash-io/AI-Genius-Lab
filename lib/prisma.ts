import { PrismaClient } from "@prisma/client";

// Simple mock adapter for development
const mockAdapter = {
  execute: () => Promise.resolve(),
  query: () => Promise.resolve([]),
  executeRaw: () => Promise.resolve(),
  queryRaw: () => Promise.resolve([]),
  transaction: () => Promise.resolve(),
};

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: mockAdapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

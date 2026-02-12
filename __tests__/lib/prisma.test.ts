
// We don't import Pool at top level to avoid stale reference
// import { Pool } from 'pg';
import { Pool } from "pg";

type GlobalPrisma = {
  prisma?: unknown;
};

// Mock pg
jest.mock('pg', () => {
  return {
    Pool: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      connect: jest.fn(),
    })),
  };
});

// Mock @prisma/adapter-pg
jest.mock('@prisma/adapter-pg', () => {
  return {
    PrismaPg: jest.fn(),
  };
});

// Mock @prisma/client
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(),
  };
});

describe('Prisma Connection Pool Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };

    // Clear the global instance to force recreation
    const globalForPrisma = globalThis as GlobalPrisma;
    delete globalForPrisma.prisma;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should use optimized settings for production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';

    // Re-import lib/prisma to trigger the code execution
    await import('../../lib/prisma');

    // Get the Pool mock that was used in this isolation context
    expect(Pool).toHaveBeenCalledWith(expect.objectContaining({
      max: 1,
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 15000,
      allowExitOnIdle: true,
    }));
  });

  it('should use default settings for development', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';

    await import('../../lib/prisma');

    expect(Pool).toHaveBeenCalledWith(expect.objectContaining({
      max: 10,
      connectionTimeoutMillis: 15000,
      idleTimeoutMillis: 15000,
      allowExitOnIdle: true,
    }));
  });
});

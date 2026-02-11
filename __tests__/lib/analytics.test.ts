import { getCategorySales } from "@/lib/admin/analytics";
import { prisma } from "@/lib/prisma";

// Mock the prisma client
jest.mock("@/lib/prisma", () => ({
  prisma: {
    purchase: {
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

describe("getCategorySales", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("correctly aggregates sales and revenue by category", async () => {
    // Mock queryRaw
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { category: "Development", sales: BigInt(2), revenue: BigInt(3000) },
        { category: "Design", sales: BigInt(1), revenue: BigInt(1500) },
        { category: "Uncategorized", sales: BigInt(1), revenue: BigInt(500) },
    ]);

    const result = await getCategorySales();

    // Verify correct calls (currently findMany)
    // After optimization, this test might need update or we keep it to test logic if we mock correctly

    // Check results
    expect(result).toHaveLength(3);

    const dev = result.find(r => r.category === "Development");
    expect(dev).toBeDefined();
    expect(dev?.sales).toBe(2);
    expect(dev?.revenue).toBe(30); // 3000 cents / 100

    const design = result.find(r => r.category === "Design");
    expect(design).toBeDefined();
    expect(design?.sales).toBe(1);
    expect(design?.revenue).toBe(15);

    const uncategorized = result.find(r => r.category === "Uncategorized");
    expect(uncategorized).toBeDefined();
    expect(uncategorized?.sales).toBe(1);
    expect(uncategorized?.revenue).toBe(5);
  });

  it("handles empty data", async () => {
    (prisma.purchase.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

    const result = await getCategorySales();
    expect(result).toEqual([]);
  });
});

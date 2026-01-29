import { getTopCoursesByRevenue } from "@/lib/admin/analytics";
import { prisma } from "@/lib/prisma";

// Mock the prisma client
jest.mock("@/lib/prisma", () => ({
  prisma: {
    purchase: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    course: {
      findMany: jest.fn(),
    },
  },
}));

describe("getTopCoursesByRevenue", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should correctly calculate top courses by revenue", async () => {
    // Setup for optimized implementation (groupBy)
    (prisma.purchase.groupBy as jest.Mock).mockResolvedValue([
      {
        courseId: "c2",
        _sum: { amountCents: 5000 },
        _count: { _all: 1 },
      },
      {
        courseId: "c1",
        _sum: { amountCents: 3000 },
        _count: { _all: 2 },
      },
    ]);

    (prisma.course.findMany as jest.Mock).mockResolvedValue([
      { id: "c2", title: "Course 2" },
      { id: "c1", title: "Course 1" },
    ]);

    const result = await getTopCoursesByRevenue(10);

    // Verify calls
    expect(prisma.purchase.groupBy).toHaveBeenCalledWith(expect.objectContaining({
      by: ["courseId"],
      orderBy: { _sum: { amountCents: "desc" } },
      take: 10
    }));

    expect(result).toHaveLength(2);
    // Course 2: $50 revenue, 1 sale. Sorted by revenue desc.
    expect(result[0].title).toBe("Course 2");
    expect(result[0].revenue).toBe(50);
    expect(result[0].sales).toBe(1);

    // Course 1: $30 revenue, 2 sales
    expect(result[1].title).toBe("Course 1");
    expect(result[1].revenue).toBe(30);
    expect(result[1].sales).toBe(2);
  });
});

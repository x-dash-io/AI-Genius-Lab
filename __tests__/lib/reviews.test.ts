import { getCourseReviewStats } from "@/lib/reviews";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/access", () => ({
  requireCustomer: jest.fn(),
  hasPurchasedCourse: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    review: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

describe("getCourseReviewStats", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return empty stats when no reviews exist", async () => {
    // Current implementation uses findMany
    (prisma.review.findMany as jest.Mock).mockResolvedValue([]);

    // Future implementation will use aggregate and groupBy
    (prisma.review.aggregate as jest.Mock).mockResolvedValue({
      _count: { _all: 0 },
      _avg: { rating: null }
    });
    (prisma.review.groupBy as jest.Mock).mockResolvedValue([]);

    const stats = await getCourseReviewStats("course1");

    expect(stats).toEqual({
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    });
  });

  it("should calculate correct stats for mixed reviews", async () => {
    const reviews = [
      { rating: 5 },
      { rating: 5 },
      { rating: 4 },
      { rating: 1 },
    ];
    // Current implementation
    (prisma.review.findMany as jest.Mock).mockResolvedValue(reviews);

    // Future implementation
    (prisma.review.aggregate as jest.Mock).mockResolvedValue({
      _avg: { rating: 3.75 },
      _count: { _all: 4 },
    });
    // groupBy returns array of { rating, _count: { _all: number } }?
    // Depending on how I write the query. Usually count is an int or object if select count?
    // groupBy with _count:
    // const results = await prisma.review.groupBy({ by: ['rating'], _count: { rating: true } or _count: true? })
    // If I use _count: { _all: true } or similar.
    // Let's assume standard return:
    (prisma.review.groupBy as jest.Mock).mockResolvedValue([
      { rating: 5, _count: { _all: 2 } },
      { rating: 4, _count: { _all: 1 } },
      { rating: 1, _count: { _all: 1 } },
    ]);

    const stats = await getCourseReviewStats("course1");

    expect(stats.averageRating).toBe(3.8); // 3.75 rounded to 1 decimal
    expect(stats.totalReviews).toBe(4);
    expect(stats.ratingDistribution).toEqual({
      5: 2,
      4: 1,
      3: 0,
      2: 0,
      1: 1,
    });
  });
});

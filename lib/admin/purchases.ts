import { prisma } from "@/lib/prisma";

export async function getAllPurchases() {
  return prisma.purchase.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPurchaseById(purchaseId: string) {
  return prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      user: true,
      course: true,
      enrollment: true,
      payments: true,
    },
  });
}

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

export async function refundPurchase(purchaseId: string) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { enrollment: true },
  });

  if (!purchase) {
    throw new Error("Purchase not found");
  }

  // Update purchase status
  await prisma.purchase.update({
    where: { id: purchaseId },
    data: { status: "refunded" },
  });

  // Delete enrollment if it exists
  if (purchase.enrollment) {
    await prisma.enrollment.delete({
      where: { id: purchase.enrollment.id },
    });
  }

  return purchase;
}

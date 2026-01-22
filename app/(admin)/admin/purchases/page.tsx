import { redirect } from "next/navigation";
import { requireRole } from "@/lib/access";
import { getAllPurchases } from "@/lib/admin/purchases";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { PurchaseFilters } from "@/components/admin/PurchaseFilters";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function AdminPurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; provider?: string; search?: string }>;
}) {
  await requireRole("admin");

  const params = await searchParams;
  let purchases = await getAllPurchases();

  // Filter by status
  if (params.status && params.status !== "all") {
    purchases = purchases.filter((p) => p.status === params.status);
  }

  // Filter by provider
  if (params.provider && params.provider !== "all") {
    purchases = purchases.filter((p) => p.provider === params.provider);
  }

  // Search
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    purchases = purchases.filter(
      (p) =>
        p.user.email.toLowerCase().includes(searchLower) ||
        p.course.title.toLowerCase().includes(searchLower) ||
        p.user.name?.toLowerCase().includes(searchLower)
    );
  }

  const totalRevenue = purchases
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountCents, 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Purchase Management
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          Purchases
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          View and manage all course purchases.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {purchases.filter((p) => p.status === "paid").length} paid purchases
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchases.filter((p) => p.status === "pending").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseFilters />
        </CardContent>
      </Card>

      {/* Purchases List */}
      {purchases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No purchases found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{purchase.course.title}</CardTitle>
                      <Badge
                        variant={
                          purchase.status === "paid"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {purchase.status}
                      </Badge>
                      <Badge variant="outline">{purchase.provider}</Badge>
                    </div>
                    <CardDescription>
                      <Link
                        href={`/admin/users/${purchase.user.id}`}
                        className="hover:underline"
                      >
                        {purchase.user.name || purchase.user.email}
                      </Link>
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{formatCurrency(purchase.amountCents)}</span>
                      <span>•</span>
                      <span>{new Date(purchase.createdAt).toLocaleDateString()}</span>
                      {purchase.providerRef && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-xs">{purchase.providerRef.slice(0, 20)}...</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/courses/${purchase.course.id}/edit`}>
                      <Button variant="outline" size="sm">
                        View Course
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

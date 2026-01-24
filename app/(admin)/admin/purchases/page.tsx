import { Suspense } from "react";
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

interface AdminPurchasesPageProps {
  searchParams: Promise<{ status?: string; provider?: string; search?: string }>;
}

export default async function AdminPurchasesPage({ searchParams }: AdminPurchasesPageProps) {
  await requireRole("admin");

  const params = await searchParams;
  const allPurchases = await getAllPurchases();
  let purchases = [...allPurchases];

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
        p.User.email.toLowerCase().includes(searchLower) ||
        p.Course.title.toLowerCase().includes(searchLower) ||
        p.User.name?.toLowerCase().includes(searchLower)
    );
  }

  const totalRevenue = purchases
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountCents, 0);

  const allTimeTotalRevenue = allPurchases
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountCents, 0);

  const totalPurchases = allPurchases.length;
  const filteredCount = purchases.length;
  const hasFilters = params.status || params.provider || params.search;

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
            <CardTitle className="text-sm font-medium">
              {hasFilters ? "Filtered Revenue" : "Total Revenue"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {purchases.filter((p) => p.status === "paid").length} paid purchases
            </p>
            {hasFilters && (
              <p className="text-xs text-muted-foreground">
                All-time: {formatCurrency(allTimeTotalRevenue)}
              </p>
            )}
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
            <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {hasFilters ? `of ${totalPurchases} total` : "All purchases"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Filter</CardTitle>
          <CardDescription>
            {hasFilters
              ? `Showing ${filteredCount} of ${totalPurchases} purchases`
              : `${totalPurchases} purchases total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-10 animate-pulse bg-muted rounded" />}>
            <PurchaseFilters />
          </Suspense>
        </CardContent>
      </Card>

      {/* Purchases List */}
      {purchases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {hasFilters
                ? "No purchases match your search criteria."
                : "No purchases found."}
            </p>
            {hasFilters && (
              <Link href="/admin/purchases">
                <Button variant="outline" size="sm">
                  Clear Filters
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-xl">{purchase.Course.title}</CardTitle>
                      <Badge
                        variant={
                          purchase.status === "paid"
                            ? "default"
                            : purchase.status === "refunded"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {purchase.status}
                      </Badge>
                      <Badge variant="outline">{purchase.provider}</Badge>
                    </div>
                    <CardDescription>
                      <Link
                        href={`/admin/users/${purchase.User.id}`}
                        className="hover:underline"
                      >
                        {purchase.User.name || purchase.User.email}
                      </Link>
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
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
                    <Link href={`/admin/courses/${purchase.Course.id}/edit`}>
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

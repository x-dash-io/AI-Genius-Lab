import { Metadata } from "next";
import { requireRole } from "@/lib/access";
import { getAdminStats } from "@/lib/admin/stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, DollarSign, GraduationCap, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { AnalyticsSection } from "@/components/admin/AnalyticsSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = generateSEOMetadata({
  title: "Admin Dashboard",
  description: "Administrative dashboard",
  noindex: true,
  nofollow: true,
});


export default async function AdminDashboardPage() {
  await requireRole("admin");
  const stats = await getAdminStats();
  type RecentPurchase = (typeof stats.recentPurchases)[number];

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Overview
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage courses, users, and monitor platform activity.
        </p>
      </div>

      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.courses.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.courses.published} published, {stats.courses.unpublished} draft
              </p>
              <Link href="/admin/courses" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                  Manage Courses
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.users.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.users.customers} customers, {stats.users.admins} admins
              </p>
              <Link href="/admin/users" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                  Manage Users
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">All-Time Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(stats.revenue.allTime)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(stats.revenue.monthly)} this month
              </p>
              <Link href="/admin/purchases" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                  View Purchases
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Recurring (MRR)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(stats.revenue.mrr)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active recurring revenue
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                Free: <span className="font-semibold text-foreground">{stats.subscribers.free}</span> •
                Pro: <span className="font-semibold text-foreground">{stats.subscribers.professional}</span> •
                Founder: <span className="font-semibold text-foreground">{stats.subscribers.founder}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Purchases */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Purchases</CardTitle>
                <CardDescription>
                  Latest course purchases and enrollments
                </CardDescription>
              </div>
              <Link href="/admin/purchases">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentPurchases.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No purchases yet.
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentPurchases.map((purchase: RecentPurchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{purchase.Course.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {purchase.User.name || purchase.User.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(purchase.amountCents)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {purchase.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analytics Charts */}
        <div>
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold tracking-tight">Analytics</h2>
            <p className="mt-2 text-muted-foreground">
              Visual insights into platform performance and trends
            </p>
          </div>
          <AnalyticsSection />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/admin/courses/new">
                <Button variant="premium" className="w-full h-14 rounded-2xl shadow-xl shadow-primary/20 text-lg group border border-white/10" size="lg">
                  <BookOpen className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Create New Course
                </Button>
              </Link>
              <Link href="/admin/learning-paths/new">
                <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-bold hover:bg-accent/50 text-lg group" size="lg">
                  <GraduationCap className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Create Learning Path
                </Button>
              </Link>
              <Link href="/admin/coupons" className="md:col-span-2">
                <Button variant="secondary" className="w-full h-14 rounded-2xl font-bold bg-accent/30 hover:bg-accent/50 text-lg group border border-border/50" size="lg">
                  <DollarSign className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Manage Coupons
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

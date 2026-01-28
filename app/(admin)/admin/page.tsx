import { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/access";
import { getAdminStats } from "@/lib/admin/stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, DollarSign, GraduationCap, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { AnalyticsSection } from "@/components/admin/AnalyticsSection";

export const metadata: Metadata = generateSEOMetadata({
  title: "Admin Dashboard",
  description: "Administrative dashboard",
  noindex: true,
  nofollow: true,
});

async function AdminDashboardContent() {
  const stats = await getAdminStats();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
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
            <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.enrollments.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Students enrolled in courses
            </p>
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
              {stats.recentPurchases.map((purchase) => (
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
              <Button className="w-full" size="lg">
                <BookOpen className="mr-2 h-4 w-4" />
                Create New Course
              </Button>
            </Link>
            <Link href="/admin/learning-paths/new">
              <Button variant="outline" className="w-full" size="lg">
                <GraduationCap className="mr-2 h-4 w-4" />
                Create Learning Path
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function AdminDashboardPage() {
  await requireRole("admin");

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

      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <AdminDashboardContent />
      </Suspense>
    </div>
  );
}

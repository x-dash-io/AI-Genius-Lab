import { redirect, notFound } from "next/navigation";
import { requireRole } from "@/lib/access";
import { getUserById, updateUserRole } from "@/lib/admin/users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Shield, User, ShoppingCart, GraduationCap, Activity } from "lucide-react";
import type { Role } from "@/lib/rbac";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

async function changeRoleAction(userId: string, formData: FormData) {
  "use server";
  await requireRole("admin");

  const role = formData.get("role") as Role;
  if (role !== "admin" && role !== "customer") {
    throw new Error("Invalid role");
  }

  await updateUserRole(userId, role);
  redirect(`/admin/users/${userId}`);
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireRole("admin");

  const { userId } = await params;
  const user = await getUserById(userId);

  if (!user) {
    notFound();
  }

  const totalSpent = user.purchases
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amountCents, 0);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              User Details
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
              {user.name || user.email}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">{user.email}</p>
          </div>
          {user.role === "admin" ? (
            <Badge variant="default" className="text-lg px-4 py-2">
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <User className="mr-2 h-4 w-4" />
              Customer
            </Badge>
          )}
        </div>
      </div>

      {/* User Info & Role Management */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{user.email}</p>
            </div>
            {user.name && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg">{user.name}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Member Since</p>
              <p className="text-lg">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
              <p className="text-lg font-semibold">{formatCurrency(totalSpent)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>Change user role</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={changeRoleAction.bind(null, user.id)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Role</label>
                <p className="text-lg capitalize">{user.role}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Change to</label>
                <select
                  name="role"
                  defaultValue={user.role}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button type="submit">Update Role</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Purchases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Purchases ({user.purchases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.purchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No purchases yet.</p>
          ) : (
            <div className="space-y-4">
              {user.purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <Link
                      href={`/admin/courses/${purchase.course.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {purchase.course.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(purchase.createdAt).toLocaleDateString()} • {purchase.provider}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(purchase.amountCents)}</p>
                    <Badge variant={purchase.status === "paid" ? "default" : "secondary"} className="mt-1">
                      {purchase.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Enrollments ({user.enrollments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No enrollments yet.</p>
          ) : (
            <div className="space-y-4">
              {user.enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <Link
                      href={`/admin/courses/${enrollment.course.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {enrollment.course.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enrolled {new Date(enrollment.grantedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.activityLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          ) : (
            <div className="space-y-2">
              {user.activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium capitalize">{log.type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

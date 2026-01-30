import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireRole } from "@/lib/access";
import { getAllUsers } from "@/lib/admin/users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Users as UsersIcon, User, Shield, Loader2 } from "lucide-react";
import { UserFilters } from "@/components/admin/UserFilters";
import { FilterSkeleton } from "@/components/ui/filter-skeleton";

interface AdminUsersPageProps {
  searchParams: Promise<{ search?: string; role?: string }>;
}

async function UserList({ searchParams }: AdminUsersPageProps) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const allUsers = await getAllUsers();
  
  // Filter out current admin's account
  let users = allUsers.filter((user: any) => user.id !== session?.user?.id);

  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    users = users.filter(
      (user: any) =>
        user.email.toLowerCase().includes(searchLower) ||
        user.name?.toLowerCase().includes(searchLower)
    );
  }

  // Apply role filter
  if (params.role) {
    users = users.filter((user: any) => user.role === params.role);
  }

  const totalUsers = allUsers.filter((u: any) => u.id !== session?.user?.id).length;
  const filteredCount = users.length;
  const hasFilters = params.search || params.role;

  return (
    <div className="space-y-8">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Filter</CardTitle>
          <CardDescription>
            {hasFilters
              ? `Showing ${filteredCount} of ${totalUsers} users`
              : `${totalUsers} users total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-10 animate-pulse bg-muted rounded" />}>
            <UserFilters />
          </Suspense>
        </CardContent>
      </Card>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {hasFilters
                ? "No users match your search criteria."
                : "No users found."}
            </p>
            {hasFilters && (
              <Link href="/admin/users" className="mt-4 inline-block">
                <Button variant="outline" size="sm">
                  Clear Filters
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((user: any) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">
                        {user.name || user.email}
                      </CardTitle>
                      {user.role === "admin" ? (
                        <Badge variant="default">
                          <Shield className="mr-1 h-3 w-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <User className="mr-1 h-3 w-3" />
                          Customer
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{user.email}</CardDescription>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{user._count.purchases} purchases</span>
                      <span>•</span>
                      <span>{user._count.enrollments} enrollments</span>
                      <span>•</span>
                      <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link href={`/admin/users/${user.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  await requireRole("admin");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          User Management
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          Users
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage user accounts, roles, and permissions.
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }>
        <UserList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

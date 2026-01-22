import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireRole } from "@/lib/access";
import { getAllUsers } from "@/lib/admin/users";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Users, User, Shield } from "lucide-react";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  await requireRole("admin");

  const allUsers = await getAllUsers();
  // Filter out current admin's account
  const users = allUsers.filter((user) => user.id !== session?.user?.id);

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

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No users found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
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

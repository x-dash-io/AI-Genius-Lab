import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireRole } from "@/lib/access";
import { getUserProfile, updateUserProfile, updateUserAvatar, changePassword } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { PasswordChangeForm } from "@/components/profile/PasswordChangeForm";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Mail, 
  Calendar, 
  Activity,
  Users,
  BookOpen,
  Receipt,
  Clock
} from "lucide-react";

async function updateProfileAction(userId: string, formData: FormData) {
  "use server";
  await requireRole("admin");
  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;

  await updateUserProfile(userId, {
    name: name || undefined,
    bio: bio || undefined,
  });
}

async function updateAvatarAction(userId: string, imageUrl: string) {
  "use server";
  await requireRole("admin");
  await updateUserAvatar(userId, imageUrl);
}

async function changePasswordAction(userId: string, formData: FormData) {
  "use server";
  await requireRole("admin");
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  await changePassword(userId, currentPassword, newPassword);
}

export default async function AdminProfilePage() {
  await requireRole("admin");
  
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const [profile, adminStats] = await Promise.all([
    getUserProfile(session.user.id),
    // Get admin-specific stats
    prisma.$transaction([
      prisma.user.count(),
      prisma.course.count(),
      prisma.purchase.count({ where: { status: "paid" } }),
      prisma.activityLog.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]),
  ]);

  if (!profile) {
    redirect("/sign-in");
  }

  const [totalUsers, totalCourses, totalPurchases, lastActivity] = adminStats;
  const hasPassword = session.user.hasPassword || false;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-5 w-5 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Admin Profile
          </p>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Account Settings
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage your administrator account and preferences.
        </p>
      </div>

      {/* Admin Info Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <ProfileAvatar
                currentImage={profile.image}
                userEmail={profile.email}
                userName={profile.name}
                onAvatarUpdate={updateAvatarAction.bind(null, session.user.id)}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{profile.name || "Administrator"}</h2>
                  <Badge variant="default" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Mail className="h-3 w-3" />
                  {profile.email}
                </div>
              </div>
            </div>
            <Separator orientation="vertical" className="h-12 hidden md:block" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Member since {new Date(profile.createdAt).toLocaleDateString("en-US", { 
                month: "long", 
                year: "numeric" 
              })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal details. This information may be visible to other admins.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              initialData={{
                name: profile.name,
                bio: profile.bio,
              }}
              updateProfileAction={updateProfileAction.bind(null, session.user.id)}
            />
          </CardContent>
        </Card>

        {/* Admin Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Platform Overview</CardTitle>
              <CardDescription>Quick stats for your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="text-sm">Total Users</span>
                </div>
                <span className="text-lg font-bold">{totalUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <BookOpen className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-sm">Total Courses</span>
                </div>
                <span className="text-lg font-bold">{totalCourses}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Receipt className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="text-sm">Paid Purchases</span>
                </div>
                <span className="text-lg font-bold">{totalPurchases}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {lastActivity ? (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">
                      {lastActivity.type.replace(/_/g, " ")}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(lastActivity.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Change */}
      {hasPassword && (
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Update your password to keep your admin account secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <PasswordChangeForm
                changePasswordAction={changePasswordAction.bind(null, session.user.id)}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

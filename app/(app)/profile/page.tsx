import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserProfile, getUserStats, updateUserProfile, updateUserAvatar, changePassword } from "@/lib/profile";
import { prisma } from "@/lib/prisma";
import { getUserSubscription } from "@/lib/subscriptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { PasswordChangeForm } from "@/components/profile/PasswordChangeForm";
import { EmailChangeForm } from "@/components/profile/EmailChangeForm";
import { ProfilePreviewBanner } from "@/components/profile/ProfilePreviewBanner";
import { Separator } from "@/components/ui/separator";
import { BookOpen, DollarSign, GraduationCap, Calendar, ShieldCheck, Zap, Rocket, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function updateProfileAction(userId: string, formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const bio = formData.get("bio") as string;

  await updateUserProfile(userId, {
    name: name || undefined,
    bio: bio || undefined,
  });
}

async function updateAvatarAction(userId: string, imageUrl: string) {
  "use server";
  await updateUserAvatar(userId, imageUrl);
}

async function changePasswordAction(userId: string, formData: FormData) {
  "use server";
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  await changePassword(userId, currentPassword, newPassword);
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/sign-in");
  }

  const [profile, stats, userWithPassword, subscription] = await Promise.all([
    getUserProfile(session.user.id),
    getUserStats(session.user.id),
    // Check if user has a password
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    }),
    getUserSubscription(session.user.id),
  ]);

  if (!profile) {
    redirect("/sign-in");
  }

  const hasPassword = !!userWithPassword?.passwordHash;

  return (
    <div className="space-y-8 pb-8">
      <ProfilePreviewBanner />

      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">Profile</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <ProfileAvatar
                currentImage={profile.image}
                userEmail={profile.email}
                userName={profile.name}
                onAvatarUpdate={updateAvatarAction.bind(null, session.user.id)}
              />
            </div>
            <Separator />
            <ProfileForm
              initialData={{
                name: profile.name,
                bio: profile.bio,
              }}
              updateProfileAction={updateProfileAction.bind(null, session.user.id)}
            />
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Courses Purchased</span>
              </div>
              <span className="text-lg font-semibold">{stats.coursesPurchased}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Spent</span>
              </div>
              <span className="text-lg font-semibold">{formatCurrency(stats.totalSpent)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Lessons Completed</span>
              </div>
              <span className="text-lg font-semibold">{stats.lessonsCompleted}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Member Since</span>
              </div>
              <span className="text-sm font-medium">
                {new Date(stats.memberSince).toLocaleDateString()}
              </span>
            </div>
            <Separator />
            <div className="space-y-3 pt-1 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <Badge variant={subscription ? "default" : "secondary"}>
                  {subscription ? (subscription.status === "pending" ? "Processing" : "Subscriber") : "Free Member"}
                </Badge>
              </div>
              {subscription && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {subscription.plan.tier === "starter" && <Zap className="h-4 w-4 text-amber-500" />}
                    {subscription.plan.tier === "professional" && <Star className="h-4 w-4 text-blue-500" />}
                    {subscription.plan.tier === "founder" && <Rocket className="h-4 w-4 text-purple-500" />}
                    <span className="text-sm font-medium">Tier</span>
                  </div>
                  <span className="text-sm font-bold uppercase tracking-tight">{subscription.plan.name}</span>
                </div>
              )}
            </div>
            <Separator />
            <div className="flex flex-col gap-3">
              <Link href="/profile/subscription">
                <Button className="w-full" size="sm">
                  Manage Subscription
                </Button>
              </Link>
              <Link href="/library">
                <Button variant="outline" className="w-full" size="sm">
                  View My Courses
                </Button>
              </Link>
              <Link href="/activity">
                <Button variant="outline" className="w-full" size="sm">
                  View Activity
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Change Card */}
      <Card>
        <CardHeader>
          <CardTitle>Change Email Address</CardTitle>
          <CardDescription>Update your account email address</CardDescription>
        </CardHeader>
        <CardContent>
          <EmailChangeForm currentEmail={profile.email} />
        </CardContent>
      </Card>

      {/* Password Change Card */}
      {hasPassword && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm
              changePasswordAction={changePasswordAction.bind(null, session.user.id)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

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
import {
  ContentRegion,
  PageContainer,
  PageHeader,
  StatusRegion,
  Toolbar,
} from "@/components/layout/shell";

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
  const memberSinceLabel = new Date(stats.memberSince).toLocaleDateString();

  return (
    <PageContainer className="space-y-6">
      <ProfilePreviewBanner />

      <PageHeader
        title="Profile Settings"
        description="Manage personal details, account security, and subscription preferences."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Profile" },
        ]}
        actions={
          <>
            <Link href="/profile/subscription">
              <Button>Manage subscription</Button>
            </Link>
            <Link href="/library">
              <Button variant="outline">Open library</Button>
            </Link>
          </>
        }
      />

      <Toolbar className="justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={subscription ? "default" : "secondary"}>
            {subscription ? (subscription.status === "pending" ? "Subscription processing" : "Subscriber") : "Free member"}
          </Badge>
          {subscription ? (
            <Badge variant="outline" className="uppercase tracking-wide">
              {subscription.plan.name}
            </Badge>
          ) : null}
        </div>
        <span className="text-xs text-muted-foreground">Member since {memberSinceLabel}</span>
      </Toolbar>

      <ContentRegion>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className="ui-surface">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information and avatar.</CardDescription>
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

          <div className="grid gap-6">
            <Card className="ui-surface">
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
                  <span className="text-sm font-medium">{memberSinceLabel}</span>
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
                  {subscription ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {subscription.plan.tier === "starter" ? <Zap className="h-4 w-4 text-warning" /> : null}
                        {subscription.plan.tier === "professional" ? <Star className="h-4 w-4 text-primary" /> : null}
                        {subscription.plan.tier === "founder" ? <Rocket className="h-4 w-4 text-success" /> : null}
                        <span className="text-sm font-medium">Tier</span>
                      </div>
                      <span className="text-sm font-bold uppercase tracking-tight">{subscription.plan.name}</span>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="ui-surface">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Link href="/profile/subscription">
                  <Button className="w-full">Manage Subscription</Button>
                </Link>
                <Link href="/library">
                  <Button variant="outline" className="w-full">View My Courses</Button>
                </Link>
                <Link href="/activity">
                  <Button variant="outline" className="w-full">View Activity</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="ui-surface">
          <CardHeader>
            <CardTitle>Change Email Address</CardTitle>
            <CardDescription>Update your account email address.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmailChangeForm currentEmail={profile.email} />
          </CardContent>
        </Card>

        {hasPassword ? (
          <Card className="ui-surface">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordChangeForm
                changePasswordAction={changePasswordAction.bind(null, session.user.id)}
              />
            </CardContent>
          </Card>
        ) : null}
      </ContentRegion>

      <StatusRegion>
        <Card className="ui-surface">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
            <p className="text-muted-foreground">
              Need billing help or account support? Contact support@aigeniuslab.com.
            </p>
            <Link href="/contact">
              <Button variant="ghost" size="sm">Contact support</Button>
            </Link>
          </CardContent>
        </Card>
      </StatusRegion>
    </PageContainer>
  );
}

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Award, CheckCircle2, Download, ExternalLink, Share2, Calendar, User, BookOpen, Copy } from "lucide-react";
import { getCertificate } from "@/lib/certificates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CertificateActions, ShareAchievement } from "@/components/certificates/CertificateActions";

export const dynamic = "force-dynamic";

interface CertificatePageProps {
  params: Promise<{ certificateId: string }>;
}

export async function generateMetadata({ params }: CertificatePageProps): Promise<Metadata> {
  const { certificateId } = await params;
  const certificate = await getCertificate(certificateId);

  if (!certificate) {
    return {
      title: "Certificate Not Found",
    };
  }

  const name = certificate.User.name || "Student";
  const itemTitle = certificate.Course?.title || certificate.LearningPath?.title || "Course";

  return {
    title: `Certificate of Completion - ${name} - ${itemTitle}`,
    description: `Verified certificate of completion for ${name} in ${itemTitle} at AI Genius Lab.`,
    openGraph: {
      type: "article",
      title: `Certificate of Completion: ${itemTitle}`,
      description: `${name} has successfully completed ${itemTitle} and earned this certificate.`,
    },
  };
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  const { certificateId } = await params;
  const certificate = await getCertificate(certificateId);

  if (!certificate) {
    notFound();
  }

  const isCourse = certificate.type === "course";
  const item = isCourse ? certificate.Course : certificate.LearningPath;
  const itemName = item?.title || "Unknown Item";
  const recipientName = certificate.User.name || "Student";

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col items-center mb-12 text-center">
        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Award className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Certificate of Completion
        </h1>
        <p className="text-lg text-muted-foreground">
          This is a verified certificate issued by AI Genius Lab.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Certificate Display */}
        <Card className="lg:col-span-2 overflow-hidden border-2 border-primary/20 shadow-xl bg-card">
          <div className="relative p-8 md:p-12 text-center space-y-8 min-h-[500px] flex flex-col justify-center">
            {/* Decorative background element */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <Award className="absolute -right-20 -bottom-20 h-96 w-96 rotate-12" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Certificate of Completion
              </p>
              <div className="h-px w-24 bg-primary/20 mx-auto" />
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground italic">This is to certify that</p>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
                {recipientName}
              </h2>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground italic">has successfully completed the {isCourse ? "course" : "learning path"}</p>
              <h3 className="text-2xl md:text-3xl font-semibold text-primary">
                {itemName}
              </h3>
            </div>

            <div className="pt-8 space-y-4">
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date Issued</p>
                  <p className="font-medium">{format(new Date(certificate.issuedAt), "MMMM d, yyyy")}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Organization</p>
                  <p className="font-medium text-primary">AI Genius Lab</p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tight">
                  Certificate ID: {certificate.certificateId}
                </p>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-[10px] font-semibold text-green-600 uppercase tracking-tighter">Verified</span>
            </div>
          </div>
        </Card>

        {/* Info & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verification</CardTitle>
              <CardDescription>Details about this certificate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Recipient</p>
                  <p className="text-sm text-muted-foreground">{recipientName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BookOpen className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{isCourse ? "Course" : "Learning Path"}</p>
                  <p className="text-sm text-muted-foreground">{itemName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Issued At</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(certificate.issuedAt), "PPP")}
                  </p>
                </div>
              </div>

              <Separator />

              <CertificateActions
                certificateId={certificate.certificateId}
                pdfUrl={certificate.pdfUrl}
                isCourse={isCourse}
                itemSlug={item?.slug}
              />
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <Share2 className="h-8 w-8 text-primary" />
                <h4 className="font-semibold">Share Achievement</h4>
                <p className="text-xs text-muted-foreground">
                  Showcase your hard work to your professional network.
                </p>
                <ShareAchievement certificateId={certificate.certificateId} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-16 text-center">
        <Link href="/">
          <Button variant="link" className="text-muted-foreground">
            &larr; Back to AI Genius Lab
          </Button>
        </Link>
      </div>
    </div>
  );
}

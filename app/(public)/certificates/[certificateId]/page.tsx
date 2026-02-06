import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Award, CheckCircle2, Download, ExternalLink, Share2, Calendar, User, BookOpen, Copy } from "lucide-react";
import { getCertificate } from "@/lib/certificates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CertificateActions, ShareAchievement } from "@/components/certificates/CertificateActions";
import { Great_Vibes } from "next/font/google";

const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"] });

export const dynamic = "force-dynamic";

interface CertificatePageProps {
  params: { certificateId: string };
}

export async function generateMetadata({ params }: CertificatePageProps): Promise<Metadata> {
  const awaitedParams = await params;
  console.log('[Certificate Page] generateMetadata params:', awaitedParams);
  const { certificateId } = awaitedParams;
  console.log('[Certificate Page] certificateId:', certificateId);
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
  const { certificateId } = params;
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
          <div className="relative p-8 md:p-12 min-h-[600px] flex flex-col">
            {/* Decorative background element */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <Award className="absolute -right-20 -bottom-20 h-96 w-96 rotate-12" />
            </div>

            {/* Top Row: Logo (Center) and Header (Center) - Vertical Stack */}
            <div className="flex flex-col items-center justify-center mb-12 relative z-10 text-center">
              {/* Logo Centered Top - Extra Large */}
              <div className="mb-6">
                <Image
                  src="/logo.png"
                  alt="AI Genius Lab"
                  width={180}
                  height={180}
                  className="h-44 w-44 object-contain"
                />
              </div>

              {/* Centered Header Below Logo */}
              <div className="w-full">
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary tracking-wider uppercase drop-shadow-sm">
                  Certificate
                </h1>
                <p className="text-sm md:text-base font-light uppercase tracking-[0.4em] text-muted-foreground mt-3">
                  Of Completion
                </p>
              </div>
            </div>

            {/* Body Content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 my-8">
              {/* Recipient Name - Fancy Font */}
              <div className="relative py-4">
                <span className="block text-lg font-medium text-muted-foreground mb-4 font-serif italic">This is to certify that</span>
                <h2 className={`${greatVibes.className} text-6xl md:text-8xl text-primary drop-shadow-md py-4`}>
                  {recipientName}
                </h2>
                <div className="h-px w-64 md:w-96 bg-border mx-auto mt-2" />
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">has successfully completed the {isCourse ? "course" : "learning path"}</p>
                <h3 className="text-2xl md:text-3xl font-bold text-primary max-w-2xl leading-tight">
                  {itemName}
                </h3>
              </div>
            </div>

            {/* Footer Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mt-auto text-center">

              {/* Left Signature */}
              <div className="flex flex-col items-center">
                <div className="w-full border-t border-muted-foreground/40 pt-2 mt-auto">
                  <p className="font-display font-bold text-sm">Program Director</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Genius Lab</p>
                </div>
              </div>

              {/* Center: Date & Seal */}
              <div className="flex flex-col items-center order-first md:order-none mb-8 md:mb-0">
                <p className="text-xs font-medium text-muted-foreground mb-4">
                  Date: {format(new Date(certificate.issuedAt), "MMMM d, yyyy")}
                </p>

                {/* Gold Seal Badge */}
                <div className="relative h-24 w-24 flex items-center justify-center">
                  <div className="absolute inset-0 bg-amber-400 rounded-full opacity-20 blur-lg"></div>
                  <div className="relative bg-gradient-to-br from-amber-300 to-amber-500 rounded-full h-20 w-20 flex items-center justify-center shadow-lg border-4 border-amber-200">
                    <Award className="h-10 w-10 text-white drop-shadow-md" />
                  </div>
                  {/* Ribbons */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-600 rotate-45 -z-10 translate-y-1"></div>
                </div>
              </div>

              {/* Right Signature */}
              <div className="flex flex-col items-center">
                <div className="w-full border-t border-muted-foreground/40 pt-2 mt-auto">
                  <p className="font-display font-bold text-sm">Course Instructor</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Authorized Signature</p>
                </div>
              </div>

            </div>

            <div className="absolute bottom-2 right-2 text-[8px] text-muted-foreground/30 font-mono">
              ID: {certificate.certificateId}
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
      </div >

      <div className="mt-16 text-center">
        <Link href="/">
          <Button variant="link" className="text-muted-foreground">
            &larr; Back to AI Genius Lab
          </Button>
        </Link>
      </div>
    </div >
  );
}

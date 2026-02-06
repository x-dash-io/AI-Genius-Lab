import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Award, CheckCircle2, Download, ExternalLink, Share2, Calendar, User, BookOpen } from "lucide-react";
import { getCertificate } from "@/lib/certificates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

interface CertificatePageProps {
  params: Promise<{ certificateId: string }>;
}

export async function generateMetadata({ params }: CertificatePageProps): Promise<Metadata> {
  const { certificateId } = params;
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
    description: `Verify the certificate of completion for ${name} in ${itemTitle}`,
  };
}

export default async function VerifyCertificatePage({ params }: CertificatePageProps) {
  const { certificateId } = params;
  const certificate = await getCertificate(certificateId);

  if (!certificate) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      {/* Same content as parent */}
      <div className="max-w-4xl mx-auto">
        <h1>{certificate.User.name}'s Certificate</h1>
      </div>
    </div>
  );
}

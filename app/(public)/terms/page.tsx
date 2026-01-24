import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = generateSEOMetadata({
  title: "Terms and Conditions",
  description: "Terms and Conditions for AI Genius Lab",
});

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Terms and Conditions
        </h1>
        <p className="mt-2 text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            By accessing and using AI Genius Lab ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms and Conditions, please do not use our services.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Use License</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Permission is granted to temporarily access the materials on AI Genius Lab for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained on the Platform</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Course Access and Enrollment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            When you purchase a course on AI Genius Lab, you receive lifetime access to that course. Access is granted to the individual purchaser only and is non-transferable. You may not share your account credentials or course access with others.
          </p>
          <p>
            All courses are digital products. Upon successful payment, you will immediately gain access to the purchased course content through your account dashboard.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Payment Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            All prices are displayed in USD unless otherwise stated. Payment must be made in full at the time of purchase. We accept payments through PayPal and other payment processors as indicated on the checkout page.
          </p>
          <p>
            All sales are final. Due to the digital nature of our products, we do not offer refunds except as required by law or at our sole discretion in exceptional circumstances.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. User Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and promptly update your account information</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Be responsible for all activities under your account</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Intellectual Property</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            All content on AI Genius Lab, including but not limited to text, graphics, logos, images, audio clips, video clips, and software, is the property of AI Genius Lab or its content suppliers and is protected by international copyright laws.
          </p>
          <p>
            You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Platform without prior written consent.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Prohibited Uses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>You may not use the Platform:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>In any way that violates any applicable law or regulation</li>
            <li>To transmit any malicious code or harmful software</li>
            <li>To impersonate or attempt to impersonate the company, employees, or other users</li>
            <li>To engage in any automated use of the system without authorization</li>
            <li>To interfere with or disrupt the Platform or servers</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Certificates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Certificates of completion are issued upon successful completion of courses or learning paths. Certificates are digital documents that verify your completion and can be verified through our certificate verification system.
          </p>
          <p>
            Certificates are non-transferable and are issued to the account holder who completed the course. Misrepresentation of certificates is prohibited.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Disclaimer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            The materials on AI Genius Lab are provided on an 'as is' basis. AI Genius Lab makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            In no event shall AI Genius Lab or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AI Genius Lab, even if AI Genius Lab or an authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>11. Revisions and Errata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            The materials appearing on AI Genius Lab could include technical, typographical, or photographic errors. AI Genius Lab does not warrant that any of the materials on its Platform are accurate, complete, or current. AI Genius Lab may make changes to the materials contained on its Platform at any time without notice.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>12. Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            AI Genius Lab has not reviewed all of the sites linked to our Platform and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by AI Genius Lab. Use of any such linked website is at the user's own risk.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>13. Modifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            AI Genius Lab may revise these Terms and Conditions at any time without notice. By using this Platform, you are agreeing to be bound by the then current version of these Terms and Conditions.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>14. Governing Law</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            These terms and conditions are governed by and construed in accordance with applicable laws. Any disputes relating to these terms and conditions shall be subject to the exclusive jurisdiction of the courts in the jurisdiction where AI Genius Lab operates.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>15. Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            If you have any questions about these Terms and Conditions, please contact us:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a 
                href="mailto:support@aigeniuslab.com"
                className="hover:text-primary transition-colors"
              >
                support@aigeniuslab.com
              </a>
            </div>
            <span className="hidden sm:inline text-muted-foreground">or</span>
            <Link href="/contact">
              <Button variant="outline" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Us
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

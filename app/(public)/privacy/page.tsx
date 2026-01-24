import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { Mail, MessageCircle } from "lucide-react";

export const metadata: Metadata = generateSEOMetadata({
  title: "Privacy Policy",
  description: "Privacy Policy for AI Genius Lab",
});

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Introduction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            AI Genius Lab  is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our online learning platform.
          </p>
          <p>
            Please read this Privacy Policy carefully. By using our Platform, you agree to the collection and use of information in accordance with this policy.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <div>
            <h4 className="font-semibold text-foreground mb-2">2.1 Personal Information</h4>
            <p>We may collect personal information that you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Name and email address</li>
              <li>Payment information (processed securely through third-party payment processors)</li>
              <li>Profile information and preferences</li>
              <li>Course progress and completion data</li>
              <li>Reviews and feedback</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-2">2.2 Automatically Collected Information</h4>
            <p>When you use our Platform, we automatically collect certain information, including:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Device information (browser type, operating system)</li>
              <li>IP address and location data</li>
              <li>Usage data (pages visited, time spent, clicks)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Monitor and analyze trends, usage, and activities</li>
            <li>Detect, prevent, and address technical issues and security threats</li>
            <li>Personalize your learning experience</li>
            <li>Send you marketing communications (with your consent)</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Information Sharing and Disclosure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf, such as payment processing, email delivery, and analytics</li>
            <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid requests by public authorities</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred</li>
            <li><strong>With Your Consent:</strong> We may share information with your explicit consent</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Data Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication and access controls</li>
            <li>Regular security assessments and updates</li>
            <li>Secure payment processing through trusted third-party providers</li>
          </ul>
          <p>
            However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Cookies and Tracking Technologies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            We use cookies and similar tracking technologies to track activity on our Platform and store certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
          </p>
          <p>We use cookies for:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Authentication and session management</li>
            <li>Remembering your preferences</li>
            <li>Analyzing usage patterns</li>
            <li>Improving user experience</li>
          </ul>
          <p>
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Platform.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Your Rights and Choices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Access:</strong> Request access to your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Portability:</strong> Request transfer of your data to another service</li>
            <li><strong>Opt-out:</strong> Opt-out of marketing communications</li>
            <li><strong>Objection:</strong> Object to certain processing activities</li>
          </ul>
          <p>
            To exercise these rights, please contact us at support@aigeniuslab.com. We will respond to your request within a reasonable timeframe.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. GDPR Compliance (EU Users)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            If you are located in the European Economic Area (EEA), you have additional rights under the General Data Protection Regulation (GDPR):
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Right to be informed about data collection</li>
            <li>Right of access to your personal data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure ("right to be forgotten")</li>
            <li>Right to restrict processing</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
            <li>Rights related to automated decision-making</li>
          </ul>
          <p>
            Our legal basis for processing your personal data includes: consent, contract performance, legal obligations, and legitimate interests.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>9. Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
          </p>
          <p>
            When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal, regulatory, or legitimate business purposes.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>10. Children's Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Our Platform is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>11. Third-Party Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Our Platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read the privacy policies of any third-party sites you visit.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>12. International Data Transfers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. We take appropriate safeguards to ensure your data is protected in accordance with this Privacy Policy.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>13. Changes to This Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
          <p>
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>14. Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
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


/**
 * Email notification service using Resend
 * Set RESEND_API_KEY and EMAIL_FROM in your environment variables
 *
 * For development without domain verification, set BYPASS_EMAIL=true
 * to skip email sending and log OTP codes instead.
 */

import { Resend } from "resend";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const resendApiKey = process.env.RESEND_API_KEY;
// For development: Use Resend's test domain (onboarding@resend.dev)
const emailFrom = process.env.EMAIL_FROM || (process.env.NODE_ENV === "development" ? "onboarding@resend.dev" : "noreply@aigeniuslab.com");
const bypassEmail = process.env.BYPASS_EMAIL === "true";

// Log email configuration on startup
if (process.env.NODE_ENV === "development") {
  console.log("[EMAIL] Configuration:", {
    bypassEmail,
    hasResendKey: !!resendApiKey,
    emailFrom,
    BYPASS_EMAIL_value: process.env.BYPASS_EMAIL,
  });
}

// Initialize Resend only if API key is available
const resend = resendApiKey ? new Resend(resendApiKey) : null;


export async function sendEmail(options: EmailOptions): Promise<void> {
  // If bypass email is enabled, log the email instead of sending
  if (bypassEmail) {
    console.log("[EMAIL] BYPASS_EMAIL=true - Email would be sent:", {
      to: options.to,
      subject: options.subject,
      preview: options.text || options.html.substring(0, 100),
    });
    // Extract OTP code from email HTML for development testing
    const codeMatch = options.html.match(/\b(\d{6})\b/) || 
                     options.text?.match(/\b(\d{6})\b/);
    if (codeMatch) {
      console.log("\n" + "=".repeat(60));
      console.log("OTP CODE FOR TESTING (BYPASS_EMAIL=true)");
      console.log("=".repeat(60));
      console.log(`Email: ${options.to}`);
      console.log(`OTP Code: ${codeMatch[1]}`);
      console.log(`Subject: ${options.subject}`);
      console.log("=".repeat(60) + "\n");
    }
    return;
  }

  // If Resend is not configured, log and return
  if (!resend) {
    console.log("[EMAIL] Email would be sent (RESEND_API_KEY not set):", {
      to: options.to,
      subject: options.subject,
      preview: options.text || options.html.substring(0, 100),
    });
    // Extract code from email HTML for development testing
    if (process.env.NODE_ENV === "development") {
      const codeMatch = options.html.match(/\b(\d{6})\b/) || 
                       options.text?.match(/\b(\d{6})\b/);
      if (codeMatch) {
        console.log("\n" + "=".repeat(60));
        console.log("OTP CODE FOR TESTING (No RESEND_API_KEY)");
        console.log("=".repeat(60));
        console.log(`Email: ${options.to}`);
        console.log(`OTP Code: ${codeMatch[1]}`);
        console.log(`Subject: ${options.subject}`);
        console.log("=".repeat(60) + "\n");
      }
    }
    return;
  }

  // Send email using Resend
  try {
    const result = await resend.emails.send({
      from: emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (result.error) {
      console.error("[EMAIL] Resend error:", result.error);

      // Handle Resend test domain restriction gracefully
      // Test domain only allows sending to account owner's email
      const errorMessage = result.error.message || "";
      const isTestDomainError = errorMessage.includes("testing emails") ||
                               errorMessage.includes("verify a domain");

      if (isTestDomainError) {
        console.warn("[EMAIL] Resend test domain restriction:", {
          message: "Using test domain - emails can only be sent to account owner's email",
          suggestion: "Verify a domain in Resend dashboard or use account owner's email for testing",
        });
        // Extract OTP code from email HTML for development testing
        // Match 6-digit codes in various formats
        const codeMatch = options.html.match(/\b(\d{6})\b/) || 
                         options.text?.match(/\b(\d{6})\b/);
        if (codeMatch) {
          console.log("\n" + "=".repeat(60));
          console.log("OTP CODE FOR TESTING (Email Restricted)");
          console.log("=".repeat(60));
          console.log(`Email: ${options.to}`);
          console.log(`OTP Code: ${codeMatch[1]}`);
          console.log(`Subject: ${options.subject}`);
          console.log("=".repeat(60) + "\n");
        }
        // Don't throw - return success to user (security best practice)
        return;
      }

      throw new Error(`Failed to send email: ${errorMessage || "Unknown error"}`);
    }

    console.log("[EMAIL] Email sent successfully:", {
      to: options.to,
      subject: options.subject,
      id: result.data?.id,
      from: emailFrom,
    });
  } catch (error) {
    console.error("[EMAIL] Failed to send email:", error);
    throw error;
  }
}

export async function sendPurchaseConfirmationEmail(
  email: string,
  courseTitle: string,
  amountCents: number
) {
  const amount = (amountCents / 100).toFixed(2);
  
  await sendEmail({
    to: email,
    subject: `Purchase Confirmation: ${courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Thank you for your purchase!</h1>
        <p>You have successfully purchased <strong>${courseTitle}</strong> for $${amount}.</p>
        <p>You can now access the course in your library.</p>
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/library" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          Go to My Library
        </a>
      </div>
    `,
    text: `Thank you for your purchase! You have successfully purchased ${courseTitle} for $${amount}. You can now access the course in your library.`,
  });
}

export async function sendEnrollmentEmail(
  email: string,
  courseTitle: string
) {
  await sendEmail({
    to: email,
    subject: `Welcome to ${courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to ${courseTitle}!</h1>
        <p>You now have access to this course. Start learning today!</p>
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/library" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          Start Learning
        </a>
      </div>
    `,
    text: `Welcome to ${courseTitle}! You now have access to this course. Start learning today!`,
  });
}

export async function sendPurchaseFailedEmail(
  email: string,
  courseTitle: string,
  reason?: string
) {
  await sendEmail({
    to: email,
    subject: `Payment Issue: ${courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Payment Issue</h1>
        <p>We encountered an issue processing your payment for <strong>${courseTitle}</strong>.</p>
        ${reason ? `<p>Reason: ${reason}</p>` : ""}
        <p>Please try again or contact support if the problem persists.</p>
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/checkout" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          Try Again
        </a>
      </div>
    `,
    text: `We encountered an issue processing your payment for ${courseTitle}. Please try again or contact support.`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetCode: string
) {
  const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password`;
  
  await sendEmail({
    to: email,
    subject: "Reset Your Password - AI Genius Lab",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Reset Your Password</h1>
        <p>You requested to reset your password for your AI Genius Lab account.</p>
        <p>Use the code below to reset your password. This code will expire in 15 minutes.</p>
        <div style="background-color: #f3f4f6; border: 2px dashed #9ca3af; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937; font-family: monospace;">
            ${resetCode}
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Go to Reset Password Page
          </a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.
        </p>
        <p style="margin-top: 10px; font-size: 12px; color: #999;">
          For security reasons, never share this code with anyone.
        </p>
      </div>
    `,
    text: `Reset Your Password\n\nYou requested to reset your password for your AI Genius Lab account.\n\nUse this code to reset your password (expires in 15 minutes):\n\n${resetCode}\n\nGo to: ${resetUrl}\n\nIf you didn't request this password reset, you can safely ignore this email.`,
  });
}

export async function sendOTPEmail(
  email: string,
  otpCode: string,
  purpose: string = "verification"
) {
  const purposeText = purpose === "signup" 
    ? "complete your account registration" 
    : purpose === "signin"
    ? "sign in to your account"
    : "verify your email address";

  await sendEmail({
    to: email,
    subject: `Your Verification Code - AI Genius Lab`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Your Verification Code</h1>
        <p>Use the code below to ${purposeText}.</p>
        <div style="background-color: #f3f4f6; border: 2px dashed #9ca3af; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937; font-family: monospace;">
            ${otpCode}
          </div>
        </div>
        <p style="font-size: 14px; color: #666;">
          This code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.
        </p>
        <p style="margin-top: 20px; font-size: 12px; color: #999;">
          For security reasons, never share this code with anyone.
        </p>
      </div>
    `,
    text: `Your Verification Code\n\nUse this code to ${purposeText}:\n\n${otpCode}\n\nThis code will expire in 10 minutes. If you didn't request this code, you can safely ignore this email.`,
  });
}

interface InvoiceItem {
  title: string;
  description?: string;
  amountCents: number;
  currency: string;
}

export async function sendInvoiceEmail(
  email: string,
  userName: string,
  invoiceNumber: string,
  invoiceDate: Date,
  items: InvoiceItem[],
  paymentMethod: string,
  transactionId?: string
) {
  const totalAmount = items.reduce((sum, item) => sum + item.amountCents, 0);
  const currency = items[0]?.currency || "USD";
  const formattedTotal = (totalAmount / 100).toFixed(2);
  const formattedDate = invoiceDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 600; margin-bottom: 4px;">${item.title}</div>
          ${item.description ? `<div style="font-size: 14px; color: #6b7280;">${item.description}</div>` : ""}
        </td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">
          $${(item.amountCents / 100).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  await sendEmail({
    to: email,
    subject: `Invoice ${invoiceNumber} - AI Genius Lab`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(to right, #3b82f6, #2563eb); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">AI Genius Lab</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0;">Invoice</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div>
              <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #111827;">Invoice Details</h2>
              <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Invoice #:</strong> ${invoiceNumber}</p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Status:</strong> <span style="color: #10b981; font-weight: 600;">Paid</span></p>
            </div>
            <div style="text-align: right;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-transform: uppercase;">Bill To</h3>
              <p style="margin: 4px 0; color: #111827; font-weight: 600;">${userName}</p>
              <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">${email}</p>
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Item</th>
                <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div style="border-top: 2px solid #e5e7eb; padding-top: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280; font-size: 14px;">Subtotal</span>
              <span style="font-weight: 600;">$${formattedTotal}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280; font-size: 14px;">Tax</span>
              <span style="font-weight: 600;">$0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 16px; border-top: 2px solid #e5e7eb; margin-top: 16px;">
              <span style="font-size: 18px; font-weight: 700; color: #111827;">Total</span>
              <span style="font-size: 24px; font-weight: 700; color: #111827;">$${formattedTotal}</span>
            </div>
          </div>
          <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #111827;">Payment Information</h3>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Payment Method:</strong> ${paymentMethod}</p>
            ${transactionId ? `<p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Transaction ID:</strong> <span style="font-family: monospace; font-size: 12px;">${transactionId}</span></p>` : ""}
          </div>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/library" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Access Your Courses
            </a>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.6;">
            This invoice confirms your purchase. All sales are final. You have immediate access to the purchased courses in your library.
          </p>
        </div>
      </div>
    `,
    text: `Invoice ${invoiceNumber}\n\nAI Genius Lab\nInvoice Date: ${formattedDate}\nStatus: Paid\n\nBill To:\n${userName}\n${email}\n\nItems:\n${items.map((item) => `- ${item.title}: $${(item.amountCents / 100).toFixed(2)}`).join("\n")}\n\nSubtotal: $${formattedTotal}\nTax: $0.00\nTotal: $${formattedTotal}\n\nPayment Method: ${paymentMethod}${transactionId ? `\nTransaction ID: ${transactionId}` : ""}\n\nThank you for your purchase!`,
  });
}

export async function sendCertificateEmail(
  email: string,
  recipientName: string,
  itemName: string,
  certificateId: string,
  pdfUrl: string
) {
  const verifyUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/certificates/verify/${certificateId}`;
  
  await sendEmail({
    to: email,
    subject: `Congratulations! Your Certificate for ${itemName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(to right, #3b82f6, #2563eb); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Congratulations!</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0;">You've earned a certificate</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Dear ${recipientName},
          </p>
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Congratulations on successfully completing <strong>${itemName}</strong>! Your dedication and hard work have paid off.
          </p>
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 24px; text-align: center; margin: 30px 0;">
            <div style="font-size: 14px; color: #92400e; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Certificate ID</div>
            <div style="font-size: 18px; font-weight: bold; color: #78350f; font-family: monospace;">${certificateId}</div>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${pdfUrl}" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 10px;">
              Download Certificate
            </a>
          </div>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Verify Certificate
            </a>
          </div>
          <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #111827;">Share Your Achievement</h3>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
              Add this certificate to your LinkedIn profile or resume to showcase your new skills!
            </p>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.6;">
            This certificate is verifiable at any time using the certificate ID above. Share the verification link with employers or colleagues.
          </p>
        </div>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            AI Genius Lab - Empowering Your AI Journey
          </p>
        </div>
      </div>
    `,
    text: `Congratulations ${recipientName}!\n\nYou have successfully completed ${itemName} and earned a certificate!\n\nCertificate ID: ${certificateId}\n\nDownload your certificate: ${pdfUrl}\n\nVerify your certificate: ${verifyUrl}\n\nShare your achievement on LinkedIn or add it to your resume to showcase your new skills!\n\nCongratulations on your achievement!\n\nAI Genius Lab`,
  });
}

export async function sendSubscriptionWelcomeEmail(
  email: string,
  userName: string,
  planType: "monthly" | "annual",
  planPrice: string,
  nextBillingDate: Date
) {
  const planName = planType === "monthly" ? "Monthly Premium" : "Annual Premium";
  const formattedBillingDate = nextBillingDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await sendEmail({
    to: email,
    subject: `Welcome to ${planName}! 🎉`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(to right, #3b82f6, #2563eb); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Premium!</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0;">Your subscription is now active</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Dear ${userName},
          </p>
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Welcome to <strong>${planName}</strong>! Thank you for choosing AI Genius Lab. Your subscription is now active and you have access to all our premium features.
          </p>
          
          <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 24px; margin: 30px 0;">
            <h3 style="margin: 0 0 16px 0; color: #1e40af; font-size: 18px;">Your Subscription Details</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #374151;">Plan:</span>
              <span style="font-weight: 600; color: #1e40af;">${planName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #374151;">Price:</span>
              <span style="font-weight: 600; color: #1e40af;">$${planPrice}/${planType === "monthly" ? "month" : "year"}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #374151;">Next billing:</span>
              <span style="font-weight: 600; color: #1e40af;">${formattedBillingDate}</span>
            </div>
          </div>

          <h3 style="margin: 30px 0 16px 0; color: #111827; font-size: 18px;">What's Included in Your Premium Subscription:</h3>
          <ul style="color: #374151; line-height: 1.8; margin-bottom: 30px;">
            <li>✅ Unlimited access to all courses (100+ and counting)</li>
            <li>✅ Certificate of completion for each course</li>
            <li>✅ Priority customer support</li>
            <li>✅ Early access to new courses and content</li>
            <li>✅ Exclusive workshops and events</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/courses" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Start Learning Now
            </a>
          </div>

          <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #111827;">Manage Your Subscription</h3>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
              You can manage or cancel your subscription anytime from your account settings.
            </p>
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/subscription" style="color: #2563eb; text-decoration: none; font-size: 14px;">
              View Subscription Settings →
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.6;">
            If you have any questions, reply to this email or contact our support team.
          </p>
        </div>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            AI Genius Lab - Empowering Your AI Journey
          </p>
        </div>
      </div>
    `,
    text: `Welcome to ${planName}!\n\nDear ${userName},\n\nThank you for choosing AI Genius Lab! Your ${planName} subscription is now active.\n\nPlan Details:\n- Plan: ${planName}\n- Price: $${planPrice}/${planType === "monthly" ? "month" : "year"}\n- Next billing: ${formattedBillingDate}\n\nYour Premium Benefits:\n- Unlimited access to all courses\n- Certificate of completion\n- Priority support\n- Early access to new content\n- Exclusive workshops\n\nStart learning: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/courses\n\nManage subscription: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/subscription\n\nQuestions? Just reply to this email!\n\nAI Genius Lab`,
  });
}

export async function sendSubscriptionCancelledEmail(
  email: string,
  userName: string,
  planType: "monthly" | "annual",
  endDate: Date
) {
  const planName = planType === "monthly" ? "Monthly Premium" : "Annual Premium";
  const formattedEndDate = endDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await sendEmail({
    to: email,
    subject: `Subscription Cancelled - ${planName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(to right, #ef4444, #dc2626); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Subscription Cancelled</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0;">We're sorry to see you go</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Dear ${userName},
          </p>
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Your <strong>${planName}</strong> subscription has been cancelled. We're sorry to see you go, but we understand.
          </p>
          
          <div style="background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 12px; padding: 24px; margin: 30px 0;">
            <h3 style="margin: 0 0 16px 0; color: #991b1b; font-size: 18px;">Important Information</h3>
            <p style="margin: 0 0 12px 0; color: #7f1d1d;">
              Your access will continue until <strong>${formattedEndDate}</strong>
            </p>
            <p style="margin: 0; color: #7f1d1d;">
              You can reactivate your subscription anytime before this date.
            </p>
          </div>

          <div style="margin: 30px 0;">
            <h3 style="margin: 0 0 16px 0; color: #111827; font-size: 18px;">What happens next?</h3>
            <ul style="color: #374151; line-height: 1.8;">
              <li>• You keep access to all courses until ${formattedEndDate}</li>
              <li>• Any certificates you've earned remain yours forever</li>
              <li>• Courses you purchased individually remain accessible</li>
              <li>• No further charges will be made to your account</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/subscription?reactivate=true" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Reactivate Subscription
            </a>
          </div>

          <div style="margin-top: 30px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #111827;">Feedback?</h3>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
              We'd love to know why you cancelled. Your feedback helps us improve.
            </p>
            <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/contact" style="color: #2563eb; text-decoration: none; font-size: 14px;">
              Share Feedback →
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.6;">
            Thank you for being part of AI Genius Lab. We hope to see you again soon!
          </p>
        </div>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            AI Genius Lab - Empowering Your AI Journey
          </p>
        </div>
      </div>
    `,
    text: `Subscription Cancelled - ${planName}\n\nDear ${userName},\n\nYour ${planName} subscription has been cancelled.\n\nImportant: Your access continues until ${formattedEndDate}\n\nWhat happens next:\n- Keep access to all courses until ${formattedEndDate}\n- Certificates remain yours forever\n- Individually purchased courses remain accessible\n- No further charges\n\nReactivate anytime: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/subscription\n\nWe'd love your feedback: ${process.env.NEXTAUTH_URL || "http://localhost:3000"}/contact\n\nThank you for choosing AI Genius Lab!`,
  });
}

export async function sendAdminSubscriptionNotification(
  adminEmail: string,
  userEmail: string,
  userName: string,
  planType: "monthly" | "annual",
  planPrice: string
) {
  const planName = planType === "monthly" ? "Monthly Premium" : "Annual Premium";
  const subscriptionUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/admin/subscriptions`;

  await sendEmail({
    to: adminEmail,
    subject: `🎉 New Premium Subscription: ${planName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(to right, #10b981, #059669); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Subscription!</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0;">A user has subscribed to Premium</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 20px;">Subscription Details</h2>
          
          <div style="background-color: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #374151;">Customer:</span>
              <span style="font-weight: 600; color: #059669;">${userName} (${userEmail})</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #374151;">Plan:</span>
              <span style="font-weight: 600; color: #059669;">${planName}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #374151;">Price:</span>
              <span style="font-weight: 600; color: #059669;">$${planPrice}/${planType === "monthly" ? "month" : "year"}</span>
            </div>
          </div>

          <p style="color: #374151; margin-bottom: 20px;">
            Time to celebrate! Another user has joined our Premium community and now has access to all courses.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${subscriptionUrl}" style="display: inline-block; padding: 14px 28px; background-color: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              View All Subscriptions
            </a>
          </div>

          <div style="margin-top: 30px; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
            <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
              This is an automated notification from AI Genius Lab Admin Dashboard
            </p>
          </div>
        </div>
      </div>
    `,
    text: `New Premium Subscription!\n\nCustomer: ${userName} (${userEmail})\nPlan: ${planName}\nPrice: $${planPrice}/${planType === "monthly" ? "month" : "year"}\n\nView all subscriptions: ${subscriptionUrl}\n\nAI Genius Lab Admin`,
  });
}

/**
 * Email notification service
 * For production, integrate with Resend, SendGrid, or similar service
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  // In development, log emails instead of sending
  if (process.env.NODE_ENV === "development") {
    console.log("[EMAIL] Email would be sent:", {
      to: options.to,
      subject: options.subject,
      preview: options.text || options.html.substring(0, 100),
    });
    return;
  }

  // For production, integrate with email service
  // Example with Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: process.env.EMAIL_FROM || "noreply@synapze.dev",
  //   to: options.to,
  //   subject: options.subject,
  //   html: options.html,
  //   text: options.text,
  // });

  // For now, just log in production too (replace with actual service)
  console.log("[EMAIL] Email notification:", {
    to: options.to,
    subject: options.subject,
  });
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

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@streamly.app";

export async function sendCreatorApprovalEmail(email: string, displayName: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "🎉 Welcome to the Creator program!",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to Streamly Creators!</h2>
          <p>Hi ${displayName},</p>
          <p>Great news! Your creator request has been <strong>approved</strong>. 🎉</p>
          <p>You can now:</p>
          <ul>
            <li>Create and publish videos</li>
            <li>Write and publish blogs</li>
            <li>Reach the Streamly community</li>
          </ul>
          <p style="margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/create" 
               style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Start Creating
            </a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">Questions? Reply to this email or visit our support.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending creator approval email:", error);
    throw error;
  }
}

export async function sendCreatorRejectionEmail(email: string, displayName: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Update on your creator request",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Creator Request Update</h2>
          <p>Hi ${displayName},</p>
          <p>Thank you for your interest in becoming a Streamly creator. Unfortunately, your request was not approved at this time.</p>
          <p>You're still welcome to:</p>
          <ul>
            <li>Browse videos and blogs</li>
            <li>Engage with the community</li>
            <li>Try again in the future</li>
          </ul>
          <p>If you have questions, feel free to reach out!</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">Best regards, Streamly Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending creator rejection email:", error);
    throw error;
  }
}

export async function sendContentApprovedEmail(email: string, contentType: "video" | "blog", title: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `✅ Your ${contentType} has been approved`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Content Approved!</h2>
          <p>Your ${contentType} "<strong>${title}</strong>" has been approved and is now live! ✅</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${contentType}s" 
               style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}
            </a>
          </p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">Thanks for contributing to Streamly!</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending content approval email:", error);
    throw error;
  }
}

export async function sendContentRejectedEmail(email: string, contentType: "video" | "blog", title: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `${contentType} Review: Needs Changes`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Review</h2>
          <p>Hi,</p>
          <p>Your ${contentType} "<strong>${title}</strong>" needs some revisions before it can be published.</p>
          <p>Please review our guidelines and feel free to resubmit.</p>
          <p>If you have questions, reach out to our support team.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">Streamly Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending content rejection email:", error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset your Streamly password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your Streamly password.</p>
          <p style="margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p style="color: #999; font-size: 12px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

import { Resend } from 'resend';

/**
 * Escape HTML special characters to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(apiKey);
}

/**
 * Send password reset email to user
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string | null | undefined,
  token: string,
  baseUrl: string
): Promise<void> {
  const resend = getResendClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!fromEmail) {
    throw new Error('RESEND_FROM_EMAIL environment variable is not set');
  }

  const displayName = userName || 'there';
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  // Escape display name to prevent XSS
  const safeDisplayName = escapeHtml(displayName);
  // URL-encode the reset URL for href attribute safety
  const safeResetUrl = encodeURI(resetUrl);

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 100%;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 400; color: #374151; font-family: Georgia, serif;">
                Reset Your Password
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
                Hi ${safeDisplayName},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a
                  href="${safeResetUrl}"
                  style="
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #4b6b52;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 500;
                  "
                >
                  Reset Password
                </a>
              </div>

              <p style="margin: 24px 0 0 0; font-size: 14px; color: #9ca3af; line-height: 1.6;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 14px; color: #9ca3af; line-height: 1.6;">
                This link will expire in 1 hour for security reasons.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                Sent with care from your Life Coach
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: 'Reset your password',
      html: emailHtml,
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

/**
 * Send email verification email for email change
 */
export async function sendEmailVerificationEmail(
  newEmail: string,
  userName: string | null | undefined,
  token: string,
  baseUrl: string
): Promise<void> {
  const resend = getResendClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!fromEmail) {
    throw new Error('RESEND_FROM_EMAIL environment variable is not set');
  }

  const displayName = userName || 'there';
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  // Escape display name to prevent XSS
  const safeDisplayName = escapeHtml(displayName);
  // URL-encode the verification URL for href attribute safety
  const safeVerifyUrl = encodeURI(verifyUrl);

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 100%;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 400; color: #374151; font-family: Georgia, serif;">
                Verify Your New Email
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
                Hi ${safeDisplayName},
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
                You requested to change your email address to ${escapeHtml(newEmail)}. Click the button below to verify this email address:
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a
                  href="${safeVerifyUrl}"
                  style="
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #4b6b52;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 500;
                  "
                >
                  Verify Email
                </a>
              </div>

              <p style="margin: 24px 0 0 0; font-size: 14px; color: #9ca3af; line-height: 1.6;">
                If you didn't request this change, you can safely ignore this email. Your email address will remain unchanged.
              </p>
              <p style="margin: 16px 0 0 0; font-size: 14px; color: #9ca3af; line-height: 1.6;">
                This link will expire in 24 hours for security reasons.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                Sent with care from your Life Coach
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: newEmail,
      subject: 'Verify your new email address',
      html: emailHtml,
    });
  } catch (error) {
    console.error('Error sending email verification email:', error);
    throw error;
  }
}

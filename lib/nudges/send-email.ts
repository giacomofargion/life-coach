import { Resend } from 'resend';
import { Nudge } from '@/lib/types';
import { generateCompletionUrl } from './email';

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }
  return new Resend(apiKey);
}

/**
 * Send nudge reminder email to a user with all their active nudges
 */
export async function sendNudgeEmail(
  userEmail: string,
  userName: string | null | undefined,
  nudges: Nudge[],
  baseUrl: string
): Promise<void> {
  if (nudges.length === 0) {
    return; // No nudges to send
  }

  const resend = getResendClient();
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!fromEmail) {
    throw new Error('RESEND_FROM_EMAIL environment variable is not set');
  }

  const displayName = userName || 'there';

  // Generate completion URLs for each nudge
  const nudgeItems = nudges.map((nudge) => {
    const completionUrl = generateCompletionUrl(nudge.id, baseUrl);
    return {
      content: nudge.content,
      completionUrl,
    };
  });

  // Create email HTML template
  const emailHtml = createEmailTemplate(displayName, nudgeItems, baseUrl);

  try {
    await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: nudges.length === 1
        ? `${displayName}, a gentle nudge from your coach`
        : `${displayName}, ${nudges.length} gentle nudges from your coach`,
      html: emailHtml,
    });
  } catch (error) {
    console.error('Error sending nudge email:', error);
    throw error;
  }
}

function createEmailTemplate(
  displayName: string,
  nudgeItems: Array<{ content: string; completionUrl: string }>,
  baseUrl: string
): string {
  const nudgeList = nudgeItems
    .map(
      (item, index) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
          <p style="margin: 0 0 12px 0; font-size: 16px; color: #374151; line-height: 1.6;">
            ${item.content}
          </p>
          <a
            href="${item.completionUrl}"
            style="
              display: inline-block;
              padding: 10px 20px;
              background-color: #4b6b52;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
            "
          >
            Mark as done
          </a>
        </td>
      </tr>
    `
    )
    .join('');

  return `
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
                A Gentle Nudge
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
                Hi ${displayName},
              </p>
              <p style="margin: 0 0 32px 0; font-size: 16px; color: #6b7280; line-height: 1.6;">
                Sometimes we need a gentle reminder. Here${nudgeItems.length > 1 ? ' are' : "'s"} what you asked me to nudge you about:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                ${nudgeList}
              </table>

              <p style="margin: 32px 0 0 0; font-size: 14px; color: #9ca3af; line-height: 1.6; font-style: italic;">
                This is just a gentle reminder—no pressure, no judgment. You'll only hear from me once a day, and only if there's something to nudge about.
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
}

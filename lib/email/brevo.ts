import {
  SendSmtpEmail,
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from '@getbrevo/brevo';

type BrevoSender = {
  name: string;
  email: string;
};

type SendEmailPayload = {
  toEmail: string;
  toName?: string;
  subject: string;
  html: string;
};

function getBrevoApi(): TransactionalEmailsApi {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is not set');
  }

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  return api;
}

function getBrevoSender(): BrevoSender {
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const fromName = process.env.BREVO_FROM_NAME;

  if (!fromEmail) {
    throw new Error('BREVO_FROM_EMAIL environment variable is not set');
  }

  if (!fromName) {
    throw new Error('BREVO_FROM_NAME environment variable is not set');
  }

  if (!fromEmail.includes('@')) {
    throw new Error('BREVO_FROM_EMAIL must be a valid email address');
  }

  return {
    name: fromName.trim(),
    email: fromEmail.trim(),
  };
}

export async function sendTransactionalEmail({
  toEmail,
  toName,
  subject,
  html,
}: SendEmailPayload): Promise<void> {
  const api = getBrevoApi();
  const sender = getBrevoSender();

  const message = new SendSmtpEmail();
  message.sender = sender;
  message.to = toName
    ? [{ email: toEmail, name: toName }]
    : [{ email: toEmail }];
  message.subject = subject;
  message.htmlContent = html;

  await api.sendTransacEmail(message);
}

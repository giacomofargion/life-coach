import crypto from 'crypto';

/**
 * Generate a signed URL for completing a nudge via email
 */
export function generateCompletionUrl(nudgeId: string, baseUrl: string): string {
  const secretKey = process.env.NUDGE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('NUDGE_SECRET_KEY environment variable is not set');
  }

  const expirationTimestamp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const message = `${nudgeId}-${expirationTimestamp}`;

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('hex');

  return `${baseUrl}/api/nudges/${nudgeId}/complete?sig=${signature}&expires=${expirationTimestamp}`;
}

/**
 * Verify a signed completion URL
 */
export function verifyCompletionUrl(
  nudgeId: string,
  signature: string,
  expires: string
): boolean {
  const secretKey = process.env.NUDGE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('NUDGE_SECRET_KEY environment variable is not set');
  }

  // Check expiration
  const expirationTimestamp = parseInt(expires, 10);
  if (Date.now() > expirationTimestamp) {
    return false; // Expired
  }

  // Verify signature
  const message = `${nudgeId}-${expirationTimestamp}`;
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(message)
    .digest('hex');

  // Check if signatures have the same length (timingSafeEqual requires same length)
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    // If there's an error (e.g., invalid hex), signature is invalid
    return false;
  }
}

import { env } from "../config/env.js";

/**
 * Sends a single transactional email via Resend's REST API.
 * Uses native fetch — no SDK dependency needed for a single call type.
 *
 * Throws on failure; callers decide whether that should fail the request
 * or just be logged (see authEmailService.js for the latter).
 */
export async function sendEmail({ to, subject, html }) {
  if (!env.resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.resendApiKey}`,
    },
    body: JSON.stringify({
      from: env.emailFrom,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend API error (${response.status}): ${body}`);
  }

  return response.json();
}

import { supabaseAdmin } from "../lib/supabase.js";
import { sendEmail } from "./emailService.js";
import { env } from "../config/env.js";

/**
 * Wraps supabase.auth.admin.generateLink(). Unlike signUp()/signInWithOtp()
 * on the anon client, generateLink() never sends an email itself — it only
 * creates/looks up the user and hands back a verification link. That's what
 * lets us own delivery end-to-end via Resend instead of Supabase's mailer.
 */
async function generateAuthLink({ type, email, password }) {
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type,
    email,
    password,
    options: { redirectTo: `${env.appUrl}/chat` },
  });

  if (error) throw error;
  return data.properties.action_link;
}

function emailShell(title, bodyHtml) {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
    <p style="font-size: 15px; letter-spacing: 0.02em; font-weight: 600; color: #f2a900; margin: 0 0 24px;">KYRO</p>
    <h1 style="font-size: 20px; margin: 0 0 16px;">${title}</h1>
    ${bodyHtml}
    <p style="font-size: 12px; color: #888; margin-top: 32px;">
      If you didn't request this, you can safely ignore this email.
    </p>
  </div>`;
}

function actionButton(link, label) {
  return `
    <a href="${link}"
       style="display: inline-block; background: #f2a900; color: #111; text-decoration: none;
              font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 6px; margin: 8px 0 16px;">
      ${label}
    </a>
    <p style="font-size: 12px; color: #888; word-break: break-all;">
      Or paste this link into your browser:<br />${link}
    </p>`;
}

/** Sends a sign-up confirmation email for a newly created (password) account. */
export async function sendSignupConfirmationEmail({ email, password }) {
  const link = await generateAuthLink({ type: "signup", email, password });
  await sendEmail({
    to: email,
    subject: "Confirm your Kyro account",
    html: emailShell(
      "Confirm your email",
      `<p style="font-size: 14px; line-height: 1.6;">Click below to confirm <strong>${email}</strong> and finish creating your Kyro account.</p>${actionButton(
        link,
        "Confirm email"
      )}`
    ),
  });
}

/** Sends a passwordless sign-in link. */
export async function sendMagicLinkEmail({ email }) {
  const link = await generateAuthLink({ type: "magiclink", email });
  await sendEmail({
    to: email,
    subject: "Your Kyro sign-in link",
    html: emailShell(
      "Sign in to Kyro",
      `<p style="font-size: 14px; line-height: 1.6;">Click below to sign in as <strong>${email}</strong>. This link expires shortly and can only be used once.</p>${actionButton(
        link,
        "Sign in"
      )}`
    ),
  });
}

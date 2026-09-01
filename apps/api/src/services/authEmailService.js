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

/**
 * Domain used for accounts created without a real email address (e.g. a
 * school-issued Google Workspace account that can't receive outside mail,
 * or someone who just doesn't have an email at all). Supabase's auth system
 * requires *some* unique email-shaped identifier per user, so we mint one
 * deterministically from the username instead of asking for a real inbox.
 * `.invalid` is the IANA-reserved TLD specifically meant for addresses that
 * are guaranteed not to resolve — nothing will ever try to deliver here.
 */
export const USERNAME_ACCOUNT_DOMAIN = "users.kyro.invalid";

export function usernameToSyntheticEmail(username) {
  return `${username.toLowerCase()}@${USERNAME_ACCOUNT_DOMAIN}`;
}

/**
 * Creates a fully confirmed account from a username + password, with no
 * email step at all. Unlike sendSignupConfirmationEmail(), this calls
 * createUser() directly (not generateLink()) and sets email_confirm: true
 * up front, since there's no inbox to send a confirmation link to.
 * Returns the synthetic email so the caller can immediately sign the user
 * in client-side with supabase.auth.signInWithPassword().
 */
export async function createUsernameAccount({ username, password }) {
  const syntheticEmail = usernameToSyntheticEmail(username);

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: syntheticEmail,
    password,
    email_confirm: true,
    user_metadata: { username: username.toLowerCase(), signup_method: "username" },
  });

  if (error) throw error;

  return { email: syntheticEmail, userId: data.user.id };
}

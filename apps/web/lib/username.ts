// Mirrors apps/api/src/services/authEmailService.js — keep in sync.
// Accounts created without a real email (school accounts that can't receive
// outside mail, or no email at all) get a synthetic, non-routable address
// derived from their username so Supabase auth still has something unique
// and email-shaped to key on.
export const USERNAME_ACCOUNT_DOMAIN = "users.kyro.invalid";

export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,24}$/;

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

export function usernameToSyntheticEmail(username: string): string {
  return `${username.toLowerCase()}@${USERNAME_ACCOUNT_DOMAIN}`;
}

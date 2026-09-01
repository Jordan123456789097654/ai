import { getSessionToken } from "./supabaseClient";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

/** Fetch wrapper that attaches the current Supabase session as a Bearer token. */
export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await getSessionToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `Request failed (${res.status})`);
  }
  return res.json();
}

export { API_BASE };

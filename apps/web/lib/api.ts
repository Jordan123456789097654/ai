import { getSessionToken } from "./supabaseClient";

/**
 * Dynamically resolves the API Gateway base URL.
 * Automatically formats missing protocols (https://) and falls back to production
 * gateway domain if NEXT_PUBLIC_API_BASE_URL is unconfigured at build time.
 */
export function getApiBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  if (typeof window !== "undefined") {
    if (!url || url.includes("localhost") || url.includes("127.0.0.1")) {
      url = "https://kyro-api-auou.onrender.com";
    }
  }

  if (!url) {
    url = "https://kyro-api-auou.onrender.com";
  }

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  return url.replace(/\/$/, "");
}

export const API_BASE = getApiBaseUrl();

/** Fetch wrapper that attaches the current Supabase session as a Bearer token. */
export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await getSessionToken();
  const baseUrl = getApiBaseUrl();

  const res = await fetch(`${baseUrl}${path}`, {
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Set true to also require the user's role to be 'admin'. */
  adminOnly?: boolean;
}

/**
 * Client-side auth guard. Checks for a valid Supabase session and redirects
 * unauthenticated users to /login. Optionally verifies admin role via /me.
 */
export default function AuthGuard({ children, adminOnly = false }: AuthGuardProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let resolved = false;

    async function verifyAdmin(session: { access_token: string }) {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const user = await res.json();
          if (user.role !== "admin") {
            router.replace("/");
            return false;
          }
        }
      } catch {
        // Network error — still let the admin page's own 403 handle it
      }
      return true;
    }

    async function handleSession(session: { access_token: string } | null) {
      if (cancelled || resolved) return;
      resolved = true;
      if (!session) {
        router.replace("/login");
        return;
      }
      if (adminOnly) {
        const ok = await verifyAdmin(session);
        if (!ok || cancelled) return;
      }
      setReady(true);
    }

    // Don't call getSession() alone here — right after a magic-link/confirmation
    // redirect, the URL still has #access_token=... in the hash and Supabase's
    // client needs a moment to parse it and persist the session. Calling
    // getSession() immediately can race that parsing and see "no session" even
    // though the link was perfectly valid, bouncing the user straight back to
    // /login. onAuthStateChange fires an INITIAL_SESSION event once Supabase
    // has finished that initial check (hash included), so we prefer that —
    // but it doesn't always fire (seen hanging on plain page loads with no
    // session at all), so a short fallback timer calls getSession() directly
    // if the event never shows up, instead of leaving the page stuck on
    // "Loading…" forever.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        handleSession(session);
      } else if (event === "SIGNED_OUT") {
        if (!cancelled) {
          resolved = true;
          router.replace("/login");
        }
      }
    });

    const fallbackTimer = setTimeout(() => {
      if (cancelled || resolved) return;
      supabase.auth.getSession().then(({ data }) => handleSession(data.session));
    }, 1500);

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
      listener.subscription.unsubscribe();
    };
  }, [router, adminOnly]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}

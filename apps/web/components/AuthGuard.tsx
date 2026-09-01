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
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      if (adminOnly) {
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
          const res = await fetch(`${API_BASE}/me`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
          if (res.ok) {
            const user = await res.json();
            if (user.role !== "admin") {
              // Redirect non-admins to home; the admin panel isn't for them
              router.replace("/");
              return;
            }
          }
        } catch {
          // Network error — still let the admin page's own 403 handle it
        }
      }

      setReady(true);
    }

    check();
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

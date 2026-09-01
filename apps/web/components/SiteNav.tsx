"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

// Chat and Docs are open to everyone — chat works without an account.
const PUBLIC_LINKS = [
  { href: "/chat", label: "Chat" },
  { href: "/docs", label: "Docs" },
];

// Requires a signed-in account.
const AUTHED_LINKS = [{ href: "/dev", label: "Developer portal" }];

export default function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session) fetchRole(session.access_token);
    });

    // Keep nav in sync with auth state changes (sign-in / sign-out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        fetchRole(session.access_token);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchRole(token: string) {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const me = await res.json();
        setIsAdmin(me.role === "admin");
      }
    } catch {
      // API unreachable — hide admin link conservatively
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const links = [
    ...PUBLIC_LINKS,
    ...(user ? AUTHED_LINKS : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg tracking-tight">
          Kyro
        </Link>

        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  active ? "text-ink bg-accent" : "text-muted hover:text-text"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {user ? (
            <button
              onClick={signOut}
              className="ml-3 px-3 py-1.5 text-sm text-muted hover:text-text border border-border rounded"
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              className="ml-3 px-3 py-1.5 text-sm bg-accent text-ink rounded font-medium"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

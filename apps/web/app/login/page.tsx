"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { API_BASE } from "../../lib/api";
import { isValidUsername, usernameToSyntheticEmail } from "../../lib/username";

type Mode = "password" | "magic" | "username";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<Mode>("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  /** Calls our own backend, which generates the Supabase auth link and emails it via Resend. */
  async function postAuth(path: string, body: Record<string, string>) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.error?.message || "Something went wrong. Please try again.");
    }
    return data;
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/chat");
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await postAuth("/auth/signup", { email, password });
      setMagicSent(true); // We send our own confirmation email via Resend
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
    setLoading(false);
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await postAuth("/auth/magic-link", { email });
      setMagicSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
    setLoading(false);
  }

  /**
   * No-email account: username + password only. Doesn't touch the confirmation
   * flow at all — the backend creates an already-confirmed account and hands
   * back the synthetic email, which we immediately sign in with.
   */
  async function handleUsernameSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!isValidUsername(username)) {
      setError("Username must be 3-24 characters: letters, numbers, _ or - only.");
      setLoading(false);
      return;
    }
    try {
      const { email: syntheticEmail } = await postAuth("/auth/signup-username", { username, password });
      const { error } = await supabase.auth.signInWithPassword({ email: syntheticEmail, password });
      if (error) throw new Error(error.message);
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  /** Sign in to an existing username account — no backend round trip needed, just derive the same synthetic email. */
  async function handleUsernameSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToSyntheticEmail(username),
      password,
    });
    if (error) {
      setError("Incorrect username or password.");
      setLoading(false);
    } else {
      router.push("/chat");
    }
  }

  if (magicSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="text-4xl">✉️</div>
          <h2 className="font-display text-2xl">Check your email</h2>
          <p className="text-muted text-sm">
            We sent a {mode === "magic" ? "sign-in link" : "confirmation link"} to{" "}
            <span className="text-text font-mono">{email}</span>. Click it to continue.
          </p>
          <button
            onClick={() => { setMagicSent(false); setError(""); }}
            className="text-sm text-muted hover:text-text underline"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <h1 className="font-display text-3xl mb-2">Sign in to Kyro</h1>
          <p className="text-muted text-sm">Your self-hosted AI platform</p>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded border border-border overflow-hidden text-sm">
          {([
            ["password", "Password"],
            ["magic", "Magic link"],
            ["username", "No email"],
          ] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2 transition-colors ${
                mode === m ? "bg-surface-raised text-text" : "text-muted hover:text-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "username" ? (
          <form onSubmit={handleUsernameSignIn} className="space-y-4">
            <p className="text-muted text-xs -mt-2">
              For accounts without a working email — like most school addresses. No confirmation email is sent.
            </p>

            <div>
              <label className="block text-sm text-muted mb-1.5">Username</label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={24}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                className="w-full bg-surface border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>

            {error && (
              <p className="text-danger text-sm bg-surface border border-danger/30 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent text-ink rounded font-medium text-sm disabled:opacity-50"
            >
              {loading ? "…" : "Sign in"}
            </button>

            <button
              type="button"
              onClick={handleUsernameSignUp}
              disabled={loading}
              className="w-full py-2.5 border border-border rounded text-sm text-muted hover:text-text disabled:opacity-50"
            >
              Create account
            </button>
          </form>
        ) : (
          <form
            onSubmit={mode === "magic" ? handleMagicLink : handlePassword}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-muted mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-surface border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>

            {mode === "password" && (
              <div>
                <label className="block text-sm text-muted mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-accent"
                />
              </div>
            )}

            {error && (
              <p className="text-danger text-sm bg-surface border border-danger/30 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent text-ink rounded font-medium text-sm disabled:opacity-50"
            >
              {loading
                ? "…"
                : mode === "magic"
                ? "Send magic link"
                : "Sign in"}
            </button>

            {mode === "password" && (
              <button
                type="button"
                onClick={handleSignUp}
                disabled={loading}
                className="w-full py-2.5 border border-border rounded text-sm text-muted hover:text-text disabled:opacity-50"
              >
                Create account
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

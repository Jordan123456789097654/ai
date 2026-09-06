"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { API_BASE } from "../../lib/api";
import { isValidUsername, usernameToSyntheticEmail } from "../../lib/username";

type Mode = "password" | "username" | "magic";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<Mode>("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  /** Direct login using email + password with instant error feedback */
  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfoMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password.");
        } else if (error.message.includes("Email not confirmed")) {
          throw new Error("Email not confirmed yet. Check your inbox or try Sign Up.");
        }
        throw error;
      }
      router.push("/chat");
    } catch (err: any) {
      setError(err.message || "Failed to sign in.");
      setLoading(false);
    }
  }

  /** Direct signup with immediate session fallback if confirmation is disabled in Supabase */
  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfoMessage("");
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.session) {
        // Instant login (Supabase email confirm is disabled)
        router.push("/chat");
      } else {
        // Confirmation required
        setInfoMessage("Account created! Check your email inbox to confirm your account.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Could not create account.");
      setLoading(false);
    }
  }

  /** Username sign in */
  async function handleUsernameSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfoMessage("");

    if (!isValidUsername(username)) {
      setError("Username must be 3-24 characters (letters, numbers, _ or -).");
      setLoading(false);
      return;
    }

    try {
      const syntheticEmail = usernameToSyntheticEmail(username);
      const { error } = await supabase.auth.signInWithPassword({
        email: syntheticEmail,
        password,
      });
      if (error) throw new Error("Incorrect username or password.");
      router.push("/chat");
    } catch (err: any) {
      setError(err.message || "Sign in failed.");
      setLoading(false);
    }
  }

  /** Username instant account creation */
  async function handleUsernameSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfoMessage("");

    if (!isValidUsername(username)) {
      setError("Username must be 3-24 characters (letters, numbers, _ or -).");
      setLoading(false);
      return;
    }

    try {
      // Create via backend auth service
      const res = await fetch(`${API_BASE}/auth/signup-username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error?.message || "Username already taken or invalid.");
      }

      // Immediately sign in with returned synthetic email
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: data.email,
        password,
      });
      if (signInErr) throw signInErr;

      router.push("/chat");
    } catch (err: any) {
      setError(err.message || "Failed to create username account.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center">
          <h1 className="font-display text-3xl mb-2">Sign in to Kyro</h1>
          <p className="text-muted text-sm">Your AI cloud platform & developer API</p>
        </div>

        {/* Mode selector */}
        <div className="flex rounded border border-border overflow-hidden text-sm">
          {([
            ["password", "Email"],
            ["username", "Username"],
            ["magic", "Magic link"],
          ] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); setInfoMessage(""); }}
              className={`flex-1 py-2 transition-colors ${
                mode === m ? "bg-surface-raised text-text" : "text-muted hover:text-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {infoMessage && (
          <div className="text-sm bg-surface border border-accent/40 text-accent rounded px-3 py-2 text-center">
            {infoMessage}
          </div>
        )}

        {error && (
          <div className="text-danger text-sm bg-surface border border-danger/30 rounded px-3 py-2 text-center">
            {error}
          </div>
        )}

        {mode === "username" ? (
          <form onSubmit={handleUsernameSignIn} className="space-y-4">
            <p className="text-muted text-xs -mt-2 text-center">
              No email required — sign in or register with a simple username.
            </p>

            <div>
              <label className="block text-sm text-muted mb-1.5">Username</label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={24}
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="yourname"
                className="w-full bg-surface border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-accent font-mono"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent text-ink rounded font-medium text-sm disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <button
              type="button"
              onClick={handleUsernameSignUp}
              disabled={loading}
              className="w-full py-2.5 border border-border rounded text-sm text-muted hover:text-text disabled:opacity-50"
            >
              Create Account
            </button>
          </form>
        ) : mode === "password" ? (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent text-ink rounded font-medium text-sm disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <button
              type="button"
              onClick={handleEmailSignUp}
              disabled={loading}
              className="w-full py-2.5 border border-border rounded text-sm text-muted hover:text-text disabled:opacity-50"
            >
              Create Account
            </button>
          </form>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              setError("");
              setInfoMessage("");
              try {
                const { error } = await supabase.auth.signInWithOtp({
                  email,
                  options: { emailRedirectTo: window.location.origin + "/chat" },
                });
                if (error) throw error;
                setInfoMessage("Magic link sent! Check your inbox.");
              } catch (err: any) {
                setError(err.message || "Failed to send magic link.");
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-muted mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-surface border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent text-ink rounded font-medium text-sm disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, AlertCircle, RefreshCw, Zap, ShieldCheck } from "lucide-react";
import { getApiBaseUrl } from "../../../../lib/api";

export default function DiscordOAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Exchanging authorization code with Discord API...");
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setStatus("error");
      setMessage("No authorization code provided by Discord.");
      return;
    }

    const processOAuth = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const redirectUri = `${window.location.origin}/auth/discord/callback`;

        const res = await fetch(`${baseUrl}/v1/discord/oauth/callback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, redirectUri }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setStatus("success");
          setMessage(data.message);
          setUserInfo(data.user);
          setTimeout(() => {
            router.push("/discord-bot");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Discord OAuth authorization failed.");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(`Network error: ${err.message}`);
      }
    };

    processOAuth();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#090a0e] text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="bg-[#121522] border border-[#242b3d] rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-xl animate-pulse">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display font-bold text-xl text-white">Connecting Discord Account...</h1>
              <p className="text-xs font-mono text-slate-400">{message}</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display font-bold text-xl text-white">Discord Account Linked!</h1>
              <p className="text-xs font-mono text-emerald-300">{message}</p>
            </div>

            {userInfo && (
              <div className="bg-[#08090d] border border-[#242b3d] rounded-xl p-4 space-y-2 text-xs font-mono">
                <div className="text-amber-400 font-bold">@{userInfo.discordTag}</div>
                <div className="text-slate-400 text-[11px]">ID: {userInfo.discordId}</div>
                <div className="pt-2 text-emerald-400 flex items-center justify-center gap-1.5 font-bold">
                  <Zap className="w-4 h-4" /> 3x Rate Limit Boost Active (60 req/min)
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-500 font-mono">Redirecting back to Kyro Suite in 3 seconds...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-xl">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display font-bold text-xl text-white">OAuth Connection Error</h1>
              <p className="text-xs font-mono text-rose-400">{message}</p>
            </div>

            <button
              onClick={() => router.push("/discord-bot")}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs font-mono transition-all border border-slate-700"
            >
              Return to Discord Panel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

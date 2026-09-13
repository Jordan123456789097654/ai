"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SandboxPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/chat");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-slate-100 flex items-center justify-center p-6 font-mono text-xs">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-400">Redirecting to Kyro AI Chat Platform...</p>
      </div>
    </div>
  );
}

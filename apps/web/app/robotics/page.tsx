"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RoboticsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/studio");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex items-center justify-center p-6">
      <div className="text-center space-y-3 font-mono">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-400">Loading Kyro 3D & Robotics Studio...</p>
      </div>
    </div>
  );
}

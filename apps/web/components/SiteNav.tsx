"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, MessageSquare, Box, Bot, FileText, Activity, Key } from "lucide-react";

export default function SiteNav() {
  const pathname = usePathname();

  // Navigation Links
  const navItems = [
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/studio", label: "3D & Robotics Studio", icon: Box },
    { href: "/discord-bot", label: "Discord Bot Panel", icon: Bot },
    { href: "/docs", label: "Docs", icon: FileText },
    { href: "/status", label: "Status", icon: Activity },
    { href: "/dev", label: "Developer Portal", icon: Key },
  ];

  return (
    <header className="border-b border-[#1f2434] bg-[#0e1017] sticky top-0 z-50 backdrop-blur-md bg-opacity-95 select-none">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-cyan-400 text-slate-950 font-bold flex items-center justify-center font-display text-sm shadow-md group-hover:scale-105 transition-transform">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-white text-base tracking-tight leading-none">Kyro AI</span>
            <span className="text-[10px] font-mono text-amber-400 font-semibold">100% Free Engine</span>
          </div>
        </Link>

        {/* Clean Modern Navigation Bar */}
        <nav className="flex items-center gap-1.5 font-mono text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-medium ${
                  isActive
                    ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-[#161a28]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

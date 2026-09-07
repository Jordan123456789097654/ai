"use client";

import { useState } from "react";

type KyroLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
};

export default function KyroLogo({ className = "", size = "md", showText = true }: KyroLogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  // Height classes guaranteeing clean visibility without being squished or tiny
  const heightClass =
    size === "sm"
      ? "h-8 md:h-9"
      : size === "md"
      ? "h-11 md:h-14"
      : size === "lg"
      ? "h-16 md:h-22"
      : "h-24 md:h-36";

  return (
    <div className={`flex items-center shrink-0 ${heightClass} ${className}`}>
      {!imgFailed ? (
        <img
          src="/logo.png"
          alt="Kyro AI Logo"
          onError={() => setImgFailed(true)}
          style={{ aspectRatio: "auto" }}
          className="h-full w-auto max-w-full object-contain shrink-0 block transition-transform hover:scale-[1.02]"
        />
      ) : (
        /* Bulletproof Inline SVG Fallback displaying Kyro AI speech bubble & orbit logo */
        <div className="flex items-center gap-2.5 font-display h-full">
          <svg className="h-full w-auto aspect-square text-accent" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="28" fill="url(#kyro-grad)" />
            <path d="M 28 85 L 38 72 L 28 72 Z" fill="#1D4ED8" />
            {/* Orbit Loops & Nodes */}
            <ellipse cx="50" cy="50" rx="28" ry="12" stroke="white" strokeWidth="4.5" transform="rotate(-30 50 50)" />
            <ellipse cx="50" cy="50" rx="28" ry="12" stroke="white" strokeWidth="4.5" transform="rotate(30 50 50)" />
            <circle cx="50" cy="50" r="5" fill="white" />
            <circle cx="36" cy="35" r="4" fill="white" />
            <circle cx="64" cy="65" r="4" fill="white" />
            <defs>
              <linearGradient id="kyro-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0ea5e9" />
                <stop offset="1" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
          </svg>
          {showText && (
            <div className="flex flex-col leading-none">
              <span className="font-bold text-white tracking-tight text-lg">Kyro</span>
              <span className="text-xs font-mono text-accent tracking-wider font-semibold">AI</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

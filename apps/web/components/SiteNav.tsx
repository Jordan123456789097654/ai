"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteNav() {
  const pathname = usePathname();

  // Hide top header bar completely on chat and root surface for a 100% clean Gemini UI
  if (pathname === "/chat" || pathname === "/") {
    return null;
  }

  return null; // Ultra-clean Gemini experience across entire platform
}

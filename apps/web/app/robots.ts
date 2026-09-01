import type { MetadataRoute } from "next";

/**
 * Generates /robots.txt automatically via Next.js App Router.
 * Blocks crawlers from authenticated routes and points to the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/docs", "/login"],
        // Block authenticated pages — they redirect to /login anyway
        disallow: ["/chat", "/dev", "/admin"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}

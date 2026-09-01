import type { MetadataRoute } from "next";

/**
 * Generates /sitemap.xml automatically via Next.js App Router.
 * Set NEXT_PUBLIC_SITE_URL in your .env to match your production domain.
 * Excludes authenticated routes (/chat, /dev, /admin) since search engines
 * can't access them and they'd just redirect to /login.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_API_BASE_URL
      ? process.env.NEXT_PUBLIC_API_BASE_URL.replace(/:4000$/, ":3000")
      : "http://localhost:3000");

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/docs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}

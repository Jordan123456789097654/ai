/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produce a minimal self-contained output directory for Docker.
  // The runner stage copies .next/standalone + .next/static only,
  // cutting the image from ~1 GB to ~200 MB.
  output: "standalone",
};

module.exports = nextConfig;

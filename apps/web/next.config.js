/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/v1/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://kyro-api-auou.onrender.com"}/v1/:path*`,
      },
      {
        source: "/dev/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://kyro-api-auou.onrender.com"}/dev/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

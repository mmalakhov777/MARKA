import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for production
  output: 'standalone',
  experimental: {
    // Enable optimizations
    optimizePackageImports: ['@tanstack/react-query'],
  },
  // Ensure proper handling of environment variables
  env: {
    NEXT_PUBLIC_TONSCAN_BASE_URL: process.env.NEXT_PUBLIC_TONSCAN_BASE_URL,
  },
  // Allow external images from Telegram
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.telesco.pe',
      },
      {
        protocol: 'https',
        hostname: 'api.telegram.org',
      },
    ],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            // Allow framing from Telegram domains for Mini App
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://web.telegram.org https://telegram.org https://*.telegram.org",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

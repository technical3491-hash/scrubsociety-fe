import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Remove 'standalone' output for Vercel (it uses its own deployment)
  // output: 'standalone', // Not needed for Vercel
  poweredByHeader: false, // Remove X-Powered-By header
  compress: true, // Enable gzip compression
  // swcMinify is deprecated in Next.js 15 - SWC minification is enabled by default
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // Vercel optimizations
  // Note: optimizeCss requires 'critters' package - removed for now
  // experimental: {
  //   optimizeCss: true,
  // },
};

export default nextConfig;


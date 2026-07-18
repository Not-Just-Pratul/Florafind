import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'kokonutui.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
      // Add patterns for Supabase storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/**',
      },
      // Add patterns for Pollinations image generation
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // ✅ Fully disables the Next.js Dev Tools UI
  devIndicators: false,

  // Optional: Disable React Strict Mode to avoid double render in dev
  reactStrictMode: false,

  // Allow cross-origin requests for dev environment
  allowedDevOrigins: ['http://192.168.29.80:9002', 'http://localhost:9002'],
};

export default nextConfig;
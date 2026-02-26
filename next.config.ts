import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Hataları önlemek için optimizasyonu kapatıyoruz
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kfsllwsvqzshggvyuqvm.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
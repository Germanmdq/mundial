import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'www.mercadopago.com.ar',
      },
      {
        protocol: 'https',
        hostname: 'www.paypalobjects.com',
      }
    ],
  },
};

export default nextConfig;

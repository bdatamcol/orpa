import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Optimizaciones para producción */
  poweredByHeader: false, // Elimina el header X-Powered-By por seguridad
  compress: true, // Habilita la compresión Gzip
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'smirsvavqrhqwzflhbwg.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'], // Formatos de imagen optimizados
  },
  reactStrictMode: true, // Activa el modo estricto de React
  
  /* Headers de seguridad */
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;

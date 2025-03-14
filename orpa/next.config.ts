import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Optimizaciones para producción */
  poweredByHeader: false, // Elimina el header X-Powered-By por seguridad
  compress: true, // Habilita la compresión Gzip
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ryeaoowbvxnwpkobxzdq.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'], // Formatos de imagen optimizados
  },
  reactStrictMode: true, // Activa el modo estricto de React
};

export default nextConfig;

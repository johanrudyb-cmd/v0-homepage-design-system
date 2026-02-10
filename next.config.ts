import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Définir explicitement la racine du workspace pour éviter les avertissements sur les lockfiles multiples
  outputFileTracingRoot: path.resolve(process.cwd()),
  // Ne pas bundler puppeteer / pdfkit (résolution depuis node_modules au runtime pour éviter ENOENT Helvetica.afm)
  serverExternalPackages: ['puppeteer', 'puppeteer-extra', 'puppeteer-extra-plugin-stealth', 'pdfkit', 'nodemailer'],
  // Turbopack désactivé en dev (--webpack) pour éviter "Failed to write app endpoint" sur Windows
  // turbopack: { root: path.resolve(process.cwd()) },
  // Configuration stricte pour sécurité et performance cache
  remotePatterns: [
    // Infrastructure
    { protocol: 'https', hostname: 'd1yei2z3i6k35z.cloudfront.net' }, // CDN Cloudfront (Higgsfield ?)
    { protocol: 'https', hostname: '**.supabase.co' }, // Supabase Storage
    { protocol: 'https', hostname: '**.amazonaws.com' }, // S3 AWS

    // Sources externes scrapées (Zalando, ASOS, etc.)
    { protocol: 'https', hostname: '**.zalando.**' },
    { protocol: 'https', hostname: '**.asos.com' },
    { protocol: 'https', hostname: '**.zara.com' },
    { protocol: 'https', hostname: 'static.zara.net' },
    { protocol: 'https', hostname: '**.hm.com' },
    { protocol: 'https', hostname: 'lp2.hm.com' },
    { protocol: 'https', hostname: 'image.uniqlo.com' },

    // Développement local
    { protocol: 'http', hostname: 'localhost' },
  ],
},
  async rewrites() {
    return [{ source: '/favicon.ico', destination: '/apple-icon.png' }];
  },
    // Headers de sécurité
    async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
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

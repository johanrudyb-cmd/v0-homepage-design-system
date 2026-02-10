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
  images: {
    // Deprecated: utiliser remotePatterns
    // domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'd1yei2z3i6k35z.cloudfront.net',
        pathname: '/6087651/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
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

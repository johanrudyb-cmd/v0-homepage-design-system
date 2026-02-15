import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SurplusModalProvider } from '@/components/usage/SurplusModalContext';
import { BackToTop } from '@/components/layout/BackToTop';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://outfity.fr';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover' as const,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'OUTFITY - Créez votre marque avec les données des géants',
    template: '%s | OUTFITY',
  },
  description:
    'Donnez à votre marque indépendante la puissance des leaders mondiaux. Tendances extraites de 15 000+ références, sourcing usines certifiées, studio de création IA et stratégie retail par BIANGORY.',
  keywords: [
    'OUTFITY',
    'BIANGORY',
    'création marque mode',
    'marques streetwear',
    'sourcing textile usine',
    'analyse tendances mode',
    'intelligence artificielle mode',
    'tech pack vêtements',
    'lancer sa marque 2026'
  ],
  authors: [{ name: 'BIANGORY', url: 'https://biangory.com' }],
  creator: 'BIANGORY',
  publisher: 'OUTFITY',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icon.png' },
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: 'OUTFITY',
    title: 'OUTFITY - Créez votre marque avec les données des géants',
    description:
      'La plateforme tout-en-un pour bâtir une marque de mode rentable grâce à la data. Mêmes données. Mêmes usines. Mêmes stratégies.',
    images: [
      {
        url: '/apple-icon.png',
        width: 512,
        height: 512,
        alt: 'OUTFITY - Intelligence Mode',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OUTFITY - Bâtissez le futur de la mode',
    description:
      'La puissance des leaders mondiaux au service des marques indépendantes. Propulsé par BIANGORY.',
    images: ['/apple-icon.png'],
    creator: '@biangory',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { Providers } from '@/components/providers/Providers';

// export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <link rel="icon" type="image/png" href="/apple-icon.png" />
        <link rel="shortcut icon" href="/apple-icon.png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="font-sans antialiased min-h-screen safe-area-padding">
        <ErrorBoundary>
          <Providers>
            <SurplusModalProvider>{children}</SurplusModalProvider>
          </Providers>
          <BackToTop />
        </ErrorBoundary>
      </body>
    </html>
  );
}

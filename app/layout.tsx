import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SurplusModalProvider } from '@/components/usage/SurplusModalContext';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://outfity.fr';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'OUTFITY - Créez votre marque avec les données des géants',
    template: '%s | OUTFITY',
  },
  description:
    'Donnez à votre marque indépendante la puissance des leaders mondiaux. Tendances 15 000+ références, sourcing usines, studio IA et stratégie. Par BIANGORY.',
  keywords: [
    'OUTFITY',
    'marque mode',
    'tendances mode',
    'sourcing textile',
    'tech pack',
    'création marque vêtements',
    'BIANGORY',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: 'OUTFITY',
    title: 'OUTFITY - Créez votre marque avec les données des géants',
    description:
      'Donnez à votre marque indépendante la puissance des leaders mondiaux. Mêmes données. Mêmes usines. Mêmes stratégies.',
    images: [{ url: '/apple-icon.png', width: 512, height: 512, alt: 'OUTFITY' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OUTFITY - Créez votre marque avec les données des géants',
    description:
      'Donnez à votre marque indépendante la puissance des leaders mondiaux. Par BIANGORY.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans antialiased">
        <SurplusModalProvider>{children}</SurplusModalProvider>
      </body>
    </html>
  );
}

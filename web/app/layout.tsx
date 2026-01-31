import React from "react"
import type { Metadata, Viewport } from 'next'
import { Poppins, Geist_Mono } from 'next/font/google'
// import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins"
});
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Médias Biangory | Le média business de la mode',
  description: 'Découvrez le média dédié aux entrepreneurs et passionnés de la mode. Articles, podcasts, vidéos et ressources pour développer votre business dans le secteur de la mode.',
  keywords: ['mode', 'fashion', 'business', 'entrepreneur', 'média', 'podcast', 'articles'],
  authors: [{ name: 'Médias Biangory' }],
  openGraph: {
    title: 'Médias Biangory | Le média business de la mode',
    description: 'Découvrez le média dédié aux entrepreneurs et passionnés de la mode.',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Médias Biangory | Le média business de la mode',
    description: 'Découvrez le média dédié aux entrepreneurs et passionnés de la mode.',
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        {/* <Analytics /> */}
      </body>
    </html>
  )
}

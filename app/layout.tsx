import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { AppProviders } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const aeonikPro = localFont({
  variable: "--font-aeonik-pro",
  display: "swap",
  src: [
    {
      path: "../public/fonts/AeonikPro/Aeonik Pro Desktop/aeonikpro-regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/AeonikPro/Aeonik Pro Desktop/aeonikpro-medium.otf",
      weight: "500",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://marka-proof.org'),
  title: {
    default: 'Marka - Blockchain Content Authentication',
    template: '%s | Marka'
  },
  description: 'Marka helps creators register and verify content authenticity on the TON blockchain. Protect your work with trustless, permanent proof of registration using your wallet.',
  keywords: ['blockchain', 'content authentication', 'TON blockchain', 'proof of authenticity', 'content verification', 'creator protection', 'deepfake prevention', 'content watermark', 'crypto verification', 'decentralized verification'],
  authors: [{ name: 'Marka' }],
  creator: 'Marka',
  publisher: 'Marka',
  icons: {
    icon: [
      { url: '/og-image.jpg', type: 'image/jpeg' },
      { url: '/og-image.jpg', sizes: '32x32', type: 'image/jpeg' },
      { url: '/og-image.jpg', sizes: '16x16', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/og-image.jpg', sizes: '180x180', type: 'image/jpeg' },
    ],
    other: [
      { url: '/og-image.jpg', sizes: '192x192', type: 'image/jpeg' },
      { url: '/og-image.jpg', sizes: '512x512', type: 'image/jpeg' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://marka-proof.org',
    siteName: 'Marka',
    title: 'Marka - Blockchain Content Authentication',
    description: 'Register and verify content authenticity on the TON blockchain. Trustless, permanent proof for creators.',
    images: [
      {
        url: '/og-image.jpg',
        width: 455,
        height: 455,
        alt: 'Marka - Blockchain Content Authentication',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marka - Blockchain Content Authentication',
    description: 'Register and verify content authenticity on the TON blockchain. Trustless, permanent proof for creators.',
    images: ['/og-image.jpg'],
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
  verification: {
    google: 'google-site-verification-code', // Add your actual verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className={`${aeonikPro.variable} ${geistSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Marka',
              description: 'Blockchain content authentication service for creators',
              url: 'https://marka-proof.org',
              applicationCategory: 'SecurityApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0.05',
                priceCurrency: 'TON',
              },
              featureList: [
                'Blockchain content registration',
                'TON wallet authentication',
                'QR code generation',
                'Content verification',
                'Social media verification'
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-app-surface text-app-foreground antialiased" suppressHydrationWarning>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

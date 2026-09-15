import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Providers } from '@/components/Providers';

// Police Outfit auto-hébergée (variable, 100→900) — performance et confidentialité.
const outfit = localFont({
  src: '../fonts/outfit-var.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Diao Shop — Maillots de football premium',
    template: '%s — Diao Shop',
  },
  description:
    'Diao Shop — boutique premium de maillots de football. Le style de vos équipes, à portée de main.',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Diao Shop',
    title: 'Diao Shop — Maillots de football premium',
    description: 'Le style de vos équipes, à portée de main.',
    images: [{ url: '/images/brand/og.jpg', width: 1200, height: 630, alt: 'Diao Shop — Maillots de football premium' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diao Shop — Maillots de football premium',
    description: 'Le style de vos équipes, à portée de main.',
    images: ['/images/brand/og.jpg'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={outfit.variable}>
      <body className="min-h-screen bg-[#0E1016] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

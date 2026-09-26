import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Галерея Михеевой — Онлайн-галерея современного искусства',
    template: '%s | Галерея Михеевой',
  },
  description:
    'Онлайн-галерея и маркетплейс для независимых художников. Оригиналы, принты и цифровое искусство от Марины Михеевой и других художников.',
  keywords: ['галерея', 'искусство', 'картины', 'художник', 'живопись', 'принты', 'купить картину'],
  authors: [{ name: 'Галерея Михеевой' }],
  creator: 'Галерея Михеевой',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    alternateLocale: 'en_US',
    url: 'https://mikheyeva.art',
    siteName: 'Галерея Михеевой',
    title: 'Галерея Михеевой — Онлайн-галерея современного искусства',
    description: 'Онлайн-галерея и маркетплейс для независимых художников.',
    images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Галерея Михеевой',
    description: 'Онлайн-галерея и маркетплейс для независимых художников.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://mikheyeva.art',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

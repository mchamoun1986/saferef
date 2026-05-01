import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { I18nProvider } from "@/lib/i18n-context";
import HtmlLangSync from "@/components/HtmlLangSync";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'SafeRef — Refrigerant Gas Detection Calculator',
    template: '%s | SafeRef',
  },
  description: 'Free refrigerant gas detection sizing tool. EN 378, ASHRAE 15 & F-Gas compliance. 47 refrigerants, 135 products. No signup.',
  keywords: [
    'refrigerant gas detection', 'EN 378', 'EN 378-3', 'ASHRAE 15', 'ISO 5149',
    'F-Gas regulation', 'EU 2024/573', 'leak detection', 'gas detector sizing',
    'R-744 CO2 detection', 'R-410A', 'R-32', 'R-290 propane', 'R-717 ammonia',
    'A2L refrigerant', 'flammable refrigerant detection', 'ATEX gas detector',
    'refrigerant leak check', 'fixed gas detection system', 'SAMON detector',
    'EN 14624', 'refrigerant safety', 'GWP', 'F-Gas leak check frequency',
  ],
  authors: [{ name: 'SafeRef' }],
  creator: 'SafeRef',
  publisher: 'SafeRef',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://saferef.vercel.app',
    siteName: 'SafeRef',
    title: 'SafeRef — Refrigerant Gas Detection Calculator',
    description: 'Free EN 378 & F-Gas compliance tool. Calculate detection requirements for any refrigerant. 47 gases, 135 products, instant results.',
    images: [{
      url: 'https://saferef.vercel.app/og-image.png',
      width: 1200,
      height: 630,
      alt: 'SafeRef — Stay safe with every refrigerant',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafeRef — Refrigerant Gas Detection Calculator',
    description: 'Free EN 378 & F-Gas compliance tool. 47 refrigerants, 135 products, instant results.',
  },
  alternates: {
    canonical: 'https://saferef.vercel.app',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SafeRef',
    applicationCategory: 'EngineeringApplication',
    operatingSystem: 'Web',
    url: 'https://saferef.vercel.app',
    description: 'Refrigerant gas detection sizing calculator for EN 378, ASHRAE 15, and EU F-Gas 2024/573 compliance.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    featureList: [
      'EN 378 compliance calculation',
      'ASHRAE 15 compliance calculation',
      'ISO 5149 compliance calculation',
      'EU F-Gas 2024/573 leak check calculator',
      '47 refrigerant database',
      '135 SAMON product catalog',
      'PDF quote generation',
      'Multi-language support (EN, FR, SV, DE, ES)',
    ],
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <I18nProvider>
          <HtmlLangSync />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

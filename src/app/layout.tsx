import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { JsonLd } from "@/components/json-ld";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://elektrojob.ch";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Elektrojobs Schweiz | Offene Stellen für Elektro-Fachkräfte | elektrojob.ch",
    template: "%s | elektrojob.ch",
  },
  description:
    "Finde aktuelle Elektrojobs in der ganzen Schweiz — Elektroinstallateur, Montage-Elektriker, Projektleiter Elektro und mehr. Jetzt Stellen vergleichen und direkt bewerben auf elektrojob.ch.",
  keywords: [
    "Elektrojobs",
    "Elektrojobs Schweiz",
    "Elektroinstallateur Jobs",
    "Montage-Elektriker Jobs",
    "Projektleiter Elektro",
    "Automatiker Jobs",
    "Elektroplaner Jobs",
    "Elektromonteur",
    "Gebäudetechnik Jobs",
    "Photovoltaik Jobs Schweiz",
    "Servicetechniker Elektro",
    "Schaltanlagenbauer",
    "Bauleiter Elektro",
    "Betriebselektriker",
    "Stellen Elektrobranche Schweiz",
  ],
  openGraph: {
    title: "Elektrojobs Schweiz | Offene Stellen für Elektro-Fachkräfte | elektrojob.ch",
    description:
      "Finde aktuelle Elektrojobs in der ganzen Schweiz — Elektroinstallateur, Montage-Elektriker, Projektleiter Elektro und mehr. Jetzt Stellen vergleichen und direkt bewerben.",
    type: "website",
    url: "/",
    siteName: "elektrojob.ch",
    locale: "de_CH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elektrojobs Schweiz | Offene Stellen für Elektro-Fachkräfte",
    description:
      "Finde aktuelle Elektrojobs in der ganzen Schweiz — Elektroinstallateur, Montage-Elektriker, Projektleiter Elektro und mehr.",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// SEO-DECISION: Organization schema placed in root layout so it appears on every page
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "elektrojob.ch",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  description:
    "elektrojob.ch ist die spezialisierte Jobbörse für Elektro-Fachkräfte in der Schweiz. Finde offene Stellen als Elektroinstallateur, Montage-Elektriker, Projektleiter Elektro und mehr.",
  foundingDate: "2025",
  areaServed: {
    "@type": "Country",
    name: "Switzerland",
    alternateName: "Schweiz",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "German",
    url: `${SITE_URL}/`,
  },
};

// SEO-DECISION: WebSite schema with SearchAction enables the Google sitelinks search box
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "elektrojob.ch",
  url: SITE_URL,
  description:
    "Die spezialisierte Jobbörse für Elektro-Fachkräfte in der Schweiz.",
  inLanguage: "de",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body lang="de" className={`${plusJakarta.variable} antialiased font-sans bg-slate-50`}>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}

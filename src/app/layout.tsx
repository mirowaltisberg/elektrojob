import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { JsonLd } from "@/components/json-ld";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://elektrojob.ch";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // SEO-DECISION: Domain removed from default title per Seobility audit —
    // domain in title is penalized. Template keeps "elektrojob.ch" for inner pages.
    default: "Elektrojobs Schweiz — Offene Stellen für Elektroinstallateur & Co.",
    template: "%s | elektrojob.ch",
  },
  description:
    "Aktuelle Elektrojobs in der Schweiz! Finde offene Stellen als Elektroinstallateur (Vollzeit/Teilzeit Pensum), Montage-Elektriker u.v.m. Jetzt bewerben!",
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
    title: "Elektrojobs Schweiz — Offene Stellen für Elektroinstallateur & Co.",
    description:
      "Aktuelle Elektrojobs in der Schweiz! Finde offene Stellen als Elektroinstallateur (Vollzeit/Teilzeit Pensum), Montage-Elektriker u.v.m. Jetzt bewerben!",
    type: "website",
    url: "/",
    siteName: "elektrojob.ch",
    locale: "de_CH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elektrojobs Schweiz | Offene Stellen für Elektroinstallateur & Co.",
    description:
      "Aktuelle Elektrojobs in der Schweiz! Finde offene Stellen als Elektroinstallateur (Vollzeit/Teilzeit Pensum), Montage-Elektriker u.v.m. Jetzt bewerben!",
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

// SEO-DECISION: LocalBusiness schema to improve visibility for local search intent
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "elektrojob.ch",
  image: `${SITE_URL}/logo.svg`,
  url: SITE_URL,
  telephone: "",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Zürich",
    addressCountry: "CH",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 47.3769,
    longitude: 8.5417,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        {/* Facebook Pixel */}
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', process.env.NEXT_PUBLIC_FB_PIXEL_ID || '00000000000');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body lang="de" className={`${plusJakarta.variable} antialiased font-sans bg-slate-50`}>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <JsonLd data={localBusinessSchema} />
        {children}
        <Analytics />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-0000000000"} />
      </body>
    </html>
  );
}

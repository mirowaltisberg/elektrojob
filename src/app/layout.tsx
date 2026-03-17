import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { JsonLd } from "@/components/json-ld";
import { HapticProvider } from "@/components/haptic-provider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.elektrojob.ch";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Elektro Jobs Schweiz 2026 | Offene Stellen finden",
    template: "%s | elektrojob.ch",
  },
  description:
    "Finde aktuelle Elektro Jobs in der Schweiz. Stellen für Elektroinstallateur EFZ, Montage-Elektriker, Servicetechniker & mehr. Jetzt Lebenslauf einreichen.",
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
    title: "Elektro Jobs Schweiz 2026 | Offene Stellen finden",
    description:
      "Finde aktuelle Elektro Jobs in der Schweiz. Stellen für Elektroinstallateur EFZ, Montage-Elektriker, Servicetechniker & mehr. Jetzt Lebenslauf einreichen.",
    type: "website",
    url: "/",
    siteName: "elektrojob.ch",
    locale: "de_CH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elektro Jobs Schweiz 2026 | Offene Stellen finden",
    description:
      "Finde aktuelle Elektro Jobs in der Schweiz. Stellen für Elektroinstallateur EFZ, Montage-Elektriker, Servicetechniker & mehr. Jetzt Lebenslauf einreichen.",
  },
  alternates: {
    canonical: "/",
    languages: {
      "de-CH": "/",
      "x-default": "/",
    },
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
  logo: `${SITE_URL}/logo.png`,
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
  sameAs: [
    "https://www.youtube.com/@elektrojob",
    "https://www.facebook.com/elektrojob",
    "https://www.instagram.com/elektrojob",
    "https://www.linkedin.com/company/elektrojob",
    "https://twitter.com/elektrojob",
  ],
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
  image: `${SITE_URL}/logo.png`,
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
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
      </head>
      <body lang="de" className={`${plusJakarta.variable} antialiased font-sans bg-slate-50`}>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <JsonLd data={localBusinessSchema} />
        <HapticProvider>{children}</HapticProvider>
        <Analytics />
        <SpeedInsights />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || "G-0000000000"}`}
          strategy="worker"
        />
        <Script id="gtag-init" strategy="worker">
          {`
            window.dataLayer=window.dataLayer||[];
            function gtag(){dataLayer.push(arguments);}
            gtag('js',new Date());
            gtag('config','${process.env.NEXT_PUBLIC_GA_ID || "G-0000000000"}');
          `}
        </Script>
        <Script id="fb-pixel" strategy="worker">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID || "0000000000000000"}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID || "0000000000000000"}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}

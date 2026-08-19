import type { Metadata, Viewport } from "next";
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
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Elektro Jobs Schweiz 2026 | Stellenangebote & Lohn",
    template: "%s | elektrojob.ch",
  },
  description:
    "Finde Elektro Jobs und Stellenangebote in der Schweiz: Elektroinstallateur EFZ, Montage-Elektriker, Servicetechniker, Temporär, Festanstellung und Lohninfos.",
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
    "Elektro Job Schweiz",
    "Elektro Stellen Schweiz",
    "Elektriker Jobs Schweiz",
    "Elektroinstallateur Stellenangebote",
    "Elektroinstallateur Temporär",
    "Elektroinstallateur Festanstellung",
    "Elektro Lohn Schweiz",
  ],
  openGraph: {
    title: "Elektro Jobs Schweiz 2026 | Stellenangebote & Lohn",
    description:
      "Finde Elektro Jobs und Stellenangebote in der Schweiz: Elektroinstallateur EFZ, Montage-Elektriker, Servicetechniker, Temporär, Festanstellung und Lohninfos.",
    type: "website",
    url: "/",
    siteName: "elektrojob.ch",
    locale: "de_CH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elektro Jobs Schweiz 2026 | Stellenangebote & Lohn",
    description:
      "Finde Elektro Jobs und Stellenangebote in der Schweiz: Elektroinstallateur EFZ, Montage-Elektriker, Servicetechniker, Temporär, Festanstellung und Lohninfos.",
  },
  alternates: {
    canonical: "/",
    languages: {
      "de-CH": "/",
      "x-default": "/",
    },
  },
  verification: {
    google: "el7V2RsquLlGsWyjTfpIu0taGlVTafpyDuinuMxx_Tc",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "elektrojob.ch",
  url: SITE_URL,
  description:
    "Die spezialisierte Jobbörse für Elektro-Fachkräfte in der Schweiz.",
  inLanguage: "de-CH",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?q={search_term_string}`,
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
      <head>
        {FB_PIXEL_ID && <link rel="dns-prefetch" href="https://connect.facebook.net" />}
      </head>
      <body lang="de" className={`${plusJakarta.variable} antialiased font-sans bg-slate-50`}>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <HapticProvider>{children}</HapticProvider>
        <Analytics />
        <SpeedInsights />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="lazyOnload"
            />
            <Script id="gtag-init" strategy="lazyOnload">
              {`
            window.dataLayer=window.dataLayer||[];
            function gtag(){dataLayer.push(arguments);}
            gtag('js',new Date());
            gtag('config','${GA_ID}');
          `}
            </Script>
          </>
        )}
        {FB_PIXEL_ID && (
          <Script id="fb-pixel" strategy="lazyOnload">
            {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
          </Script>
        )}
        {FB_PIXEL_ID && (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        )}
      </body>
    </html>
  );
}

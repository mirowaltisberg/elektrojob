import type { Metadata } from "next";
import { JobFinder } from "@/components/job-finder";

export const metadata: Metadata = {
  title: "CV senden & Elektrojobs entdecken",
  description:
    "Sende deinen Lebenslauf an unser Team und entdecke Elektrojobs per Swipe. Zeige uns, welche Stellen dich interessieren – ohne Konto oder Motivationsschreiben.",
  alternates: { canonical: "/job-finder" },
  robots: { index: false, follow: true },
};

export default function JobFinderPage() {
  return <JobFinder />;
}

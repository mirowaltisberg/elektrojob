import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
export const metadata: Metadata = { title: "Datenschutz", description: "Hinweise zu Bewerbungen und optionaler Nutzungsanalyse auf elektrojob.ch", alternates: { canonical: "/datenschutz" } };
export default function DatenschutzPage() {
 return <div className="min-h-screen bg-slate-50"><main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
  <Link href="/" className="underline">elektrojob.ch</Link>
  <h1 className="text-3xl font-bold">Datenschutz und Bewerbungen</h1>
  <section className="space-y-3"><h2 className="text-xl font-semibold">Deine Bewerbung</h2><p>Name, E-Mail-Adresse, Telefonnummer, Stellen-ID und ein freiwillig beigefügter Lebenslauf werden für die interne Prüfung durch das Plattformteam gespeichert. Eine automatische Weiterleitung an einen Arbeitgeber erfolgt nicht.</p><p>Die Einwilligung wird mit Zeitpunkt dokumentiert. Unterlagen liegen in einem privaten Speicherbereich. Zur Begrenzung wiederholter Anfragen wird ein serverseitig geschützter Hash der IP-Adresse gespeichert, keine IP-Adresse im Klartext. Nach 90 Tagen ist eine Löschprüfung vorgesehen; die tatsächliche Löschung erfolgt durch den Betriebsprozess.</p></section>
  <section className="space-y-3"><h2 className="text-xl font-semibold">Optionale Nutzungsanalyse</h2><p>Nur mit deiner Zustimmung erfassen wir Seitenaufrufe, Klicks, Bewerbungsschritte und bestätigte Speicherungen mit zufälliger Sitzungs-ID. Formulareingaben, Kontaktdaten, Lebensläufe und Suchbegriffe werden nicht in die Nutzungsereignisse aufgenommen. Die Daten sind im privaten Supabase-Projekt gespeichert und für öffentliche Browserzugriffe gesperrt. Für Nutzungsereignisse ist eine Löschprüfung nach 400 Tagen vorgesehen.</p><p>Die Auswahl kannst du jederzeit unter «Tracking-Einstellungen» ändern. Die Bewerbung funktioniert auch ohne diese Zustimmung.</p><Link href="/werbemessung" className="underline">Separate Google-Werbemessung</Link></section>
  <section className="space-y-3"><h2 className="text-xl font-semibold">Kontakt zu deinen Daten</h2><p>Für Rückfragen, Auskunft, Berichtigung, Löschung oder Widerruf wende dich an den auf unserer Kontaktseite angegebenen Plattformkontakt:</p><a className="underline" href="mailto:info@elektrojob.ch">info@elektrojob.ch</a></section>
 </main><SiteFooter /></div>;
}

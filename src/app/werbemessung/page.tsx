import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Google-Werbemessung",
  robots: { index: false, follow: false },
};

export default function AdMeasurementPage() {
  return (
    <main id="main-content" className="mx-auto min-h-screen max-w-3xl space-y-6 bg-white px-5 py-10 text-slate-900">
      <Link href="/" className="underline">Zur Jobbörse</Link>
      <h1 className="text-3xl font-bold">Google-Werbemessung</h1>
      <p>Stand: 7. September 2026</p>
      <p>Nur nach deiner freiwilligen Zustimmung zu «Google-Werbemessung» laden wir den Google-Tag von Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Damit prüfen wir, welche Google-Anzeigen zu gespeicherten Bewerbungen führen.</p>
      <p>Google erhält technische Verbindungs- und Gerätedaten, darunter die IP-Adresse, Informationen zum Anzeigenklick sowie ein Erfolgssignal mit einer zufälligen Vorgangs-ID. Wir übermitteln keine Namen, E-Mail-Adressen, Telefonnummern, Formulartexte oder Lebensläufe. Erweiterte Conversions und personalisierte Werbung sind in dieser Einbindung ausgeschaltet.</p>
      <p>Cookies der Gruppe «_gcl_» können den Anzeigenklick bis zu 90 Tage speichern. Google ordnet eine Bewerbung in unserem Konto einem Klick innerhalb von 30 Tagen zu. Die Information «Bewerbung gespeichert» bedeutet keine Zusage einer Stelle oder Weiterleitung an einen Arbeitgeber.</p>
      <p>Google kann Daten auch in den USA verarbeiten. Weitere Informationen zur Verarbeitung, Aufbewahrung und deinen Rechten findest du in <a className="underline" href="https://policies.google.com/privacy">Googles Datenschutzerklärung</a> und den <a className="underline" href="https://business.safety.google/privacy/">Informationen zu Google-Werbeprodukten</a>.</p>
      <p>Deine Auswahl wird im lokalen Browserspeicher dieser Website gespeichert. Du kannst sie jederzeit über «Tracking-Einstellungen» ändern. Bei Ablehnung laden wir diesen Google-Tag nicht. Nach einem Widerruf senden wir keine weiteren Bewerbungsereignisse und entfernen die von dieser Website erreichbaren Anzeigen-Cookies. Bereits übermittelte Daten werden durch den Widerruf nicht rückwirkend gelöscht.</p>
      <p>Die Jobbörse und das Bewerbungsformular funktionieren auch ohne diese Zustimmung. Die Verarbeitung deiner Bewerbungsunterlagen ist von der Werbemessung getrennt.</p>
      <p><Link href="/kontakt" className="underline">Kontakt zum Websitebetreiber</Link></p>
    </main>
  );
}

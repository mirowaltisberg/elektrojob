# Suchergebnis-Beschreibungen für Stellen

Stand: 8. September 2026. Implementiert und lokal geprüft; Veröffentlichung durch den Hauptagenten ausstehend.

## Änderung

Die Stellen-Metadaten wiederholten bisher Beruf und Ort in einer allgemeinen Einleitung und schnitten den Text nach 155 Zeichen teilweise mitten im Wort ab. Aufgaben und Anforderungen, die bereits öffentlich auf der Detailseite stehen, erschienen dadurch fast nie im vorgeschlagenen Suchergebnis-Text.

Die gemeinsame Beschreibung für Meta-Tag, Open Graph und Twitter enthält jetzt Beruf, Ort sowie bekanntes Pensum und bekannte Anstellungsart. Danach folgt eine vollständige öffentliche Aufgabe, die in die Beschreibung passt. Falls keine Aufgabe passt, wird eine vollständige Anforderung mit «Anforderung:» verwendet. Ein erkanntes leeres Abschnittslabel wird übersprungen. Fehlen passende Angaben, bleibt die Beschreibung kurz. Es werden keine Standardaufgaben, Vertragsdaten, Löhne, Arbeitgebernamen, Datumsangaben oder IDs zur künstlichen Unterscheidung ergänzt.

200 Zeichen sind ein redaktionelles Budget dieser Umsetzung, kein von Google vorgegebenes Limit. Ganze Quellenzeilen werden nur übernommen, wenn sie hineinpassen; dadurch bleiben Einschränkungen und Kontext erhalten. Die Auswahl greift ausschliesslich auf den bestehenden öffentlichen `JobListing`-Datentyp zu. Rohbeschreibungen, Arbeitgeber- und Kontaktdaten werden nicht gelesen. JobPosting, Seitentitel, Suche, Stellenzahl, Einwilligung und Ads bleiben unverändert.

## Vergleich mit dem aktuellen öffentlichen Bestand

457 Stellen am 8. September 2026 über die öffentliche API mit regulärer Pagination gelesen. Alle 457 alten Beschreibungen stimmen exakt mit dem gespeicherten Produktionscrawl nach PR 15 überein. Der Vergleich verwendet für jede Stelle denselben öffentlichen Datensatz vor und nach der Änderung.

| Messwert | Bisher | Neue Implementierung |
|---|---:|---:|
| Unterschiedliche Beschreibungen | 345 | 421 |
| Gruppen identischer Beschreibungen | 57 | 27 |
| Seiten in solchen Gruppen | 169 | 63 |

Das sind 106 weniger Seiten mit einer identischen Beschreibung, rund 63 Prozent weniger. Gleiche belegte Fakten bleiben weiterhin gleich. Von 457 Stellen haben 202 öffentliche Aufgaben und 232 Anforderungen; insgesamt 284 mindestens eines davon. Ohne zusätzliche belegte Quellenangaben lässt sich der übrige Bestand nicht sinnvoll beliebig unterscheiden.

Der vollständige Vergleich liegt im gemeinsamen Arbeitsbereich unter `marketing/seo-snippets-2026-09-08/snippet-vergleich.json`. Die Ergebnisse beschreiben die lokal erzeugten Metadaten auf dem aktuellen öffentlichen Snapshot, keine bereits geänderte Google-Suchansicht.

## Beispiele

**Elektroinstallateur/in in Langenthal, Bern:**

- Bisher: «Elektroinstallateur/in in Langenthal, Bern. Aktuell gesucht wird eine Fachkraft als Elektroinstallateur/in in Langenthal, Bern. Anstellungsart nicht ang...»
- Neu: «Elektroinstallateur/in in Langenthal, Bern. Selbstständige Durchführung von klassischen Installationen auf Klein- und Grossbaustellen.»

**Servicetechniker/in Elektro in Dübendorf, Zürich:**

- Bisher: «Servicetechniker/in Elektro in Dübendorf, Zürich. Aktuell gesucht wird eine Fachkraft als Servicetechniker/in Elektro in Dübendorf, Zürich. Anstellungsa...»
- Neu: «Servicetechniker/in Elektro in Dübendorf, Zürich. Montage, Inbetriebnahme und Instandhaltung von Brandmelde- und Gaslöschanlagen.»

## Prüfung und Grenzen

- 17 Node-Tests bestanden: neun zur Zusammenfassung und acht zur bestehenden öffentlichen Daten-/Quellengrenze.
- TypeScript, gezieltes ESLint, `git diff --check` und Produktionsbuild mit Webpack bestanden. Der isolierte Build wurde ohne private Datenbank-Konfiguration ausgeführt; die inhaltliche Prüfung verwendet den separaten aktuellen öffentlichen API-Snapshot.
- Alle 457 Ergebnisse geprüft: höchstens 200 Zeichen, keine hinzugefügten IDs/Datumswerte, keine Kontaktdaten oder Quellenlinks im neuen Ausgabepfad. Die zwei im vorhandenen öffentlichen Bestand aufgefallenen langen institutionellen Einleitungen werden nicht in die neuen Metadaten übernommen, weil keine vollständige Zeile hineinpasst. Ihre bestehenden Seitentexte sind ein separater Quellenqualitätsbefund; diese Änderung ersetzt keine allgemeine Namenserkennung.
- Google kann einen anderen Seitenausschnitt anzeigen. Die Wirkung auf Klickrate und Rankings muss nach erneuter Verarbeitung anhand echter Search-Console-Daten beurteilt werden. [Google-Dokumentation zu Snippets](https://developers.google.com/search/docs/appearance/snippet)

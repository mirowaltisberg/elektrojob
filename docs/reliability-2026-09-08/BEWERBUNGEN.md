# Bewerbungsablauf: Zuverlässigkeitsprüfung vom 8. September 2026

## Bestätigte Fehler und Korrekturen

1. **Vorschau-Bewerbungen wurden vor dem Speichern mit HTTP 403 abgewiesen.** Die API erlaubte ausschliesslich die beiden Produktionsadressen, obwohl sie bereits eine eigene Einstufung für synthetische Vorschau-Bewerbungen enthält. Unter `VERCEL_ENV=preview` ergänzt sie jetzt ausschliesslich die exakten, serverseitig konfigurierten Adressen `VERCEL_URL` und `VERCEL_BRANCH_URL`. Beliebige Vercel-Adressen, manipulierte Host-Header, HTTP-Adressen und fremde Herkunft bleiben gesperrt. Die Produktionsregeln bleiben unverändert.
2. **Beschädigte Multipart-Anfragen erschienen als Dienstunterbruch.** Fehler beim Dekodieren der Formulardaten fielen bisher in die allgemeine HTTP-503-Antwort. Sie werden jetzt als Eingabefehler mit HTTP 400 beantwortet. Die Grössenbegrenzung antwortet weiterhin mit HTTP 413.

3. **Bewerbungshinweise widersprachen dem Formular.** Die Detailseite nannte den CV optional; die Startseitenanleitung versprach DOC-/DOCX-Uploads. Beide Hinweise verlangen jetzt korrekt Name, PDF-Lebenslauf bis 4 MB und die erforderliche Einwilligung. Auch die veraltete Funktions- und Speicherbeschreibung im README wurde berichtigt. Die ältere API-Kompatibilität bleibt unverändert.

Die Prüfung von Herkunft und Formulardaten liegt in `src/lib/application-request.ts`; die API verwendet dieselben Funktionen. Die Extraktion ermöglicht Tests mit echten Web-Request-, FormData- und File-Objekten ohne Zugang zu Produktionsdaten.

## Geprüfter bestehender Ablauf

- Das sichtbare Formular verlangt Name, PDF und Einwilligung. Die API prüft die Felder zusätzlich. Der ältere API-Ablauf mit E-Mail und Telefon bleibt kompatibel.
- Dateiname, MIME-Typ, Grössenlimit von 4 MiB, PDF-Anfang und -Ende sowie erkannte ausführbare oder verschlüsselte PDF-Inhalte werden geprüft.
- Ein CV wird vor dem Bewerbungsdatensatz in den privaten Bucket geschrieben. Dateipfade enthalten zufällige IDs statt Namen oder Kontaktangaben.
- Die Bestätigung enthält eine gültige Bewerbungs-ID und wird erst nach bestätigtem Speichern ausgegeben. Ein HTTP-Erfolg ohne diese Bestätigung reicht dem Browser nicht.
- Identische Wiederholungen nutzen dieselbe abgeleitete ID. Ein verlorener Antwort-Request soll deshalb keine zweite Bewerbung erzeugen. Bei parallelen Wiederholungen entscheidet der Primärschlüssel der Datenbank.
- Nach einer unklaren Insert-Antwort wird zuerst nach dem Datensatz gesucht. Ein bereits zugeordneter CV wird nicht gelöscht. Ein nachweislich überflüssiger zweiter Upload kann entfernt werden.
- Eine fehlgeschlagene optionale Statistik darf die Bewerbung nicht verwerfen. Dafür besteht eine Grenze von 1,5 Sekunden. Der vorhandene eindeutige Statistikindex verhindert doppelte Speicherereignisse je Bewerbungs-ID.
- Der Browser behält Name und Datei nach einer fehlgeschlagenen Übermittlung oder einem Verbindungsabbruch und verwendet bei erneutem Senden dieselbe Einreichungs-ID.
- Die API begrenzt kurzfristige Versuche pro Instanz und gespeicherte reale Bewerbungen pro gehashter IP. Bereits gespeicherte Wiederholungen werden vor der dauerhaften Quote bestätigt.
- Produktions-Testläufe verlangen weiterhin ein zeitlich begrenztes, signiertes Token. Vorschau-Bewerbungen werden serverseitig als synthetisch eingestuft. An diesem Schutz wurde nichts geändert.

## Nachweise

- 22 lokale Tests erfolgreich: PDF-/Formularprüfung, Bestätigung, Wiederholung, Statistikfehler, Testsignatur, Rate-Limit sowie sechs neue Tests für Herkunft, Multipart-Daten und Uploadgrösse.
- `npx tsc --noEmit --incremental false`: erfolgreich.
- ESLint für die geänderte API und die neuen Request-Dateien: erfolgreich.
- Kein Produktionsdatensatz und keine Produktionsdatei wurde durch diese Teilprüfung angelegt, verändert oder gelöscht. Die Browserprüfung der ausgelieferten Vorschau erfolgt separat durch den Hauptagenten.

## Verbleibende Grenzen

Falls eine Datenbankantwort dauerhaft unklar bleibt, wird der bereits hochgeladene CV absichtlich behalten, um keine eventuell gespeicherte Bewerbung zu beschädigen. Eine automatische spätere Zuordnung oder Bereinigung solcher unklaren Uploads ist in dieser Route nicht vorhanden. Die PDF-Prüfung ist eine Format- und Merkmalsprüfung; sie ersetzt keine vollständige PDF-Analyse. Lokale Tests ersetzen nicht die Prüfung der tatsächlich konfigurierten Datenbank und des Buckets.

## Primärquellen

- [Vercel: Systemvariablen für Auslieferungs- und Branch-Adressen](https://vercel.com/docs/environment-variables/system-environment-variables)
- [Supabase: Datei hochladen](https://supabase.com/docs/reference/javascript/file-buckets-upload)
- [Supabase: Datensätze einfügen](https://supabase.com/docs/reference/javascript/insert)

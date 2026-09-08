![Caine](../cro-2026-09-07/caine-logo.svg)

# CV zuerst, Interessen danach

Der Job-Finder ergänzt den bestehenden Bewerbungsweg auf elektrojob.ch. Eine Person gibt ihren Namen an, lädt einen PDF-Lebenslauf hoch und bestätigt die Einwilligung. Der CV wird sofort als allgemeines Profil zur internen Prüfung gespeichert. Anschliessend kann die Person reale Stellen nach rechts oder links wischen oder die sichtbaren Tasten verwenden. Erst «Interessen senden» übermittelt die Zusammenfassung.

## Bestehender Versand

Der vorhandene Outlook-Dienst des Teams verarbeitet neue CVs alle zwei Minuten. Er verwendet den bereits eingerichteten Absender, die vorhandene Empfängerauswahl und die bestehende Prüfung auf bereits gemeldete Namen. Ein CV und seine Interessenübersicht haben getrennte Versandstände. Es gibt keine neue E-Mail-Plattform, keine neuen Zugangsdaten und keine automatische Weiterleitung an Arbeitgeber.

Der CV bleibt im privaten Speicher. Die bestehende Benachrichtigung enthält einen sieben Tage gültigen Link. Die Interessenübersicht nennt nur die tatsächlich gewählten Tätigkeiten, Orte und Pensen und enthält die Stellenlinks. Abgebrochene Auswahlen werden nicht automatisch versendet. Bei einem unklaren Versandresultat ist eine Prüfung erforderlich; dieselbe Nachricht wird nicht blind nochmals gesendet.

## Verifikation vor Veröffentlichung

- Produktions-Build: 194 Seiten erfolgreich erstellt; Typprüfung und Prüfung der geänderten Dateien bestanden.
- 5 Prüfungen für geschützte Sitzungen und sachliche Interessenübersichten bestanden.
- 13 Prüfungen an der Datenbank bestanden: wiederholter Upload, parallele Auswahl, Abschluss, allgemeines Profil im bestehenden Bewerbungseingang und Uploadbegrenzung. Nur eigene Testdaten wurden anschliessend entfernt.
- Bestehende Bewerbung: 22 Prüfungen; Werbung: 2 Prüfungen; Stellensuche: 12 Prüfungen bestanden.
- Zusätzliche Prüfung verhindert, dass ein älterer Browser-Tab Interessen einem neu gestarteten Profil zuordnet.
- Der Versanddienst wurde separat mit 6261 Prüfungen, Typprüfung, Produktions-Build und einer Kontrolle auf Zugangsdaten im Browsercode geprüft.

Die abschliessende Prüfung auf der veröffentlichten Website und der tatsächliche Empfang der beiden Test-E-Mails werden nach der Bereitstellung ergänzt. Synthetische Prüfungen zählen nicht als Google-Ads-Conversion und gehen ausschliesslich an das bereits verbundene Absenderpostfach.

## Betrieb

Die Sitzung kann sieben Tage lang fortgesetzt werden. Wie beim bestehenden Bewerbungsweg ist nach 90 Tagen eine Löschprüfung vorgesehen; eine neue automatische Löschung wurde nicht eingeführt. Der Lebenslauf wird unabhängig davon gespeichert und zur Prüfung gemeldet, ob die Person danach Stellen auswählt.

Benötigte Bereitstellungsreihenfolge: zuerst die Erweiterung des vorhandenen Versanddiensts im CRM, danach diese Website. Die fünf zugehörigen Datenbankmigrationen wurden bereits angewendet; die Dateinamen entsprechen den registrierten Datenbankversionen.

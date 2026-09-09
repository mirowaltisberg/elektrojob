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

Synthetische Prüfungen zählen nicht als Google-Ads-Conversion und gehen ausschliesslich an das bereits verbundene Absenderpostfach.

## Prüfung auf der veröffentlichten Website am 9. September 2026

- Der Einstieg «CV senden & Jobs entdecken» ist auf der Startseite sichtbar und öffnet den Job-Finder.
- Ein gültiger Test-CV wurde über Chrome auf der veröffentlichten Website hochgeladen. Genau ein allgemeines Profil wurde im bestehenden Bewerbungseingang gespeichert. Die privat gespeicherte Datei stimmt Byte für Byte mit der hochgeladenen PDF überein.
- Die CV-Nachricht kam um 09:09 Uhr im Outlook-Posteingang an, bevor die erste Stelle ausgewählt wurde. Ihr geschützter Link öffnet die richtige PDF ohne Administratorzugang.
- Auf einem Bildschirm mit 390 Pixeln Breite wurden ein Swipe nach rechts, die linke Pfeiltaste und die sichtbare Interessiert-Taste geprüft. Ergebnis: drei beurteilte Stellen, zwei interessant, eine übersprungen.
- Ein Neuladen sowie der erneute Einstieg über die Startseite stellen die gespeicherte Auswahl wieder her. Eine Datei, die nur auf «.pdf» endet, wird mit verständlicher Meldung abgewiesen.
- Die gespeicherte Zusammenfassung nennt Automatiker/in in Oensingen und Elektromonteur/in in Widnau, jeweils 100 Prozent. Es wurden keine zusätzlichen Einzelbewerbungen angelegt.
- Anfragen ohne Sitzung erhalten keine persönlichen Angaben. Anfragen von einer fremden Website und Schreibversuche mit der Sitzungsnummer eines anderen Tabs werden abgewiesen.

- Die Interessen-Nachricht wurde um 09:44 Uhr im Outlook-Postfach empfangen. Der Nachrichtentext stimmt mit der gespeicherten Auswahl überein; die Anlage «Job-Finder-Interessen.md» ist vorhanden. Die Transportdetails bestätigen die Zustellung um 09:44:15 Uhr. Bei der Kontrolle lag die Nachricht in «Gelöschte Elemente»; die CV-Nachricht lag im Posteingang.
- Die Website aktualisiert beide Versandstände zu «an unser Team gesendet». Ein weiterer Aufruf des Versanddiensts verarbeitete null Aufträge und verschickte keine zweite Nachricht. Der CV hat einen Versandversuch; die Zusammenfassung einen vor dem Versand übersprungenen und einen erfolgreichen Versuch.
- Anschliessend wurden ausschliesslich das eigene synthetische Profil, seine private Test-PDF, Auswahl und Versanddatensätze entfernt. Die als TEST gekennzeichneten E-Mails bleiben als Nachweis im Postfach; ihr Test-PDF-Link ist nach der Bereinigung nicht mehr verfügbar.

Der erste synthetische Zusammenfassungsversuch wurde vor dem Versand zurückgehalten, weil mehrere vorhandene Outlook-Verbindungen zur gleichen Adresse gehören. Die veröffentlichte Korrektur bindet den Test an seine ursprüngliche Verbindung; die Empfängerauswahl für echte CVs bleibt unverändert. Die Produktionsprüfung erfolgte mit Website-Stand `1c5fa8a` und Versanddienst-Stand `e9916dd`; beide wurden über den normalen PR- und Freigabeweg veröffentlicht.

## Betrieb

Die Sitzung kann sieben Tage lang fortgesetzt werden. Wie beim bestehenden Bewerbungsweg ist nach 90 Tagen eine Löschprüfung vorgesehen; eine neue automatische Löschung wurde nicht eingeführt. Der Lebenslauf wird unabhängig davon gespeichert und zur Prüfung gemeldet, ob die Person danach Stellen auswählt.

Benötigte Bereitstellungsreihenfolge: zuerst die Erweiterung des vorhandenen Versanddiensts im CRM, danach diese Website. Die fünf zugehörigen Datenbankmigrationen wurden bereits angewendet; die Dateinamen entsprechen den registrierten Datenbankversionen.

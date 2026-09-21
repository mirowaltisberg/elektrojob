# Sichtungsnachweise für CRM-Vakanzen

Ein Datenbank-Änderungsdatum belegt nicht, dass ein unverändertes Inserat erneut
gefunden wurde. Der bestehende tägliche Elektro-Scrape liefert deshalb explizite
Sichtungsnachweise, ohne Firmenangaben öffentlich zu machen.

- Worker kennzeichnen nur den letzten vollständig abgeschlossenen Stand mit
  `complete`, `completedQueries` und `expectedQueries`. Geworfene Scraperfehler
  brechen den Worker ab. Zwischenstände und alte Artefakte werden zurückgewiesen.
- Der Publisher übernimmt weiterhin erst den geprüften Gesamtbestand und entfernt
  danach überholte Inserate. Erst nach erfolgreicher Bestandsprüfung schreibt er
  die Nachweise atomar mit `record_job_ad_snapshot`.
- Fingerabdruck: SHA-256 aus vollständigem Firmennamen, Titel und erstem Ortsteil,
  jeweils kleingeschrieben und nur Unicode-Buchstaben/Zahlen. Rechtsformen und
  Akzente bleiben erhalten. Geänderte Tracking-URLs erzeugen keinen falschen Abgang.
- Der älteste `scrapedAt`-Wert aller vollständigen Chunks identifiziert den Lauf.
  Derselbe oder ein älterer Stand kann Fehlbeobachtungen nicht mehrfach zählen.
- Wiederauftauchen setzt den Zähler zurück. Es werden maximal 90 Tage alte
  Sichtungsnachweise aufbewahrt. Beide Tabellen sind nur mit Dienstrechten lesbar.

Das CRM wertet erst zwei fehlende Sichtungen mit mindestens 24 Stunden Abstand
als Prüfanlass. Es schliesst nie automatisch eine Vakanz. Ein Suchergebnis ist
kein vollständiger Bestand des Stellenportals: Suchlimits, Alter und intern vom
Scraper abgefangene Quellenfehler können Treffer auslassen. Deshalb bleibt die
Entscheidung ausdrücklich beim Berater.

## Freigabe

Vor Merge/erstem neuen Publisher-Lauf die Migration
`20260921164334_job_ad_lifecycle.sql` im **Rolejobs-Projekt mwnhzniryagcchotspwm**
anwenden. Nicht auf der CRM-Datenbank ausführen. Ohne Migration schlägt der neue
Publisher beim Schreiben der Nachweise sichtbar fehl. Alte Nachweise werden
nicht aus `updated_at` erzeugt. Die CRM-Erweiterung wartet auf den ersten neuen
erfolgreichen Lauf. Die Migration wurde am 21.09.2026 nach ausdrücklicher Freigabe angewendet; beide Tabellen sind RLS-geschützt und weder anonym noch für angemeldete Browser lesbar. Der erste neue vollständige Quelllauf bleibt vor der CRM-Ankündigung erforderlich.

## Prüfung

`python -m unittest discover -s scripts -p 'test_job_*.py'` prüft Quellenfelder,
unvollständige/veraltete Artefakte und fehlgeschlagene Publikation ohne Netzwerk.
`JOB_LIFECYCLE_TEST_DB=postgresql://127.0.0.1:55481/job_lifecycle_test node scripts/test-job-lifecycle-db.mjs`
prüft die echte Migration mit synthetischen Daten: private Rechte, Wiederholung,
Reihenfolge, parallele Aufrufe, Wiederauftauchen und Aufbewahrungsgrenze.
Die eigene GitHub-Prüfung nutzt PostgreSQL 17 und keine produktiven Schlüssel.

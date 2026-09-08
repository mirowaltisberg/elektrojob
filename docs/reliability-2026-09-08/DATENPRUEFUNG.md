# Rohdaten und öffentliche Stellen: 8. September 2026

Nur lesende Prüfung des bestätigten Supabase-Projekts **Rolejobs** (`mwnhzniryagcchotspwm`). Keine Bewerbungsdaten, keine Änderungen an Datensätzen. Grundlage: IDs aus allen drei Seiten des aktuell ausgelieferten öffentlichen Endpunkts `/api/jobs?limit=200&offset=…`, verbunden mit der Tabelle `public.jobs`.

| Merkmal | Alle aktuellen Elektro-Rohdaten | Davon aktuell öffentlich |
|---|---:|---:|
| Inserate | 462 | 413 |
| Vollständiger Quelltext vorhanden | 462 | 413 |
| Vollständiger Quelltext mindestens 300 Zeichen | 461 | 412 |
| Vollständiger Quelltext mindestens 800 Zeichen | 460 | 411 |
| Mindestens ein Aufgabenpunkt aus der Quelle | 223 | 204 |
| Mindestens ein Anforderungspunkt aus der Quelle | 250 | 219 |
| Mindestens zwei Aufgaben und zwei Anforderungen aus der Quelle | 164 | 147 |

Alle Rohdaten stammen laut gespeichertem Quellenfeld von Indeed. Die Publikationsdaten reichen vom 3. August bis 7. September 2026; keine Zukunftsdatierung. Unter den 413 öffentlichen Inseraten gibt es 405 unterschiedliche vollständige Quelltexte. Die Medianlänge beträgt 3411 Zeichen. 143 Inserate haben weder strukturierte Aufgaben noch strukturierte Anforderungen.

**Alle 413 öffentlichen Beschreibungen beginnen mit der generierten Formulierung «Aktuell gesucht wird». Kein Rohtext beginnt damit.** Der öffentliche Loader lädt bisher die ausführlichen Quelltexte und Aufgaben-/Anforderungsarrays nicht. `buildPublicJobCopy` erzeugt stattdessen Berufsprofile. Lange verfügbare Quelltexte allein beweisen daher nicht, dass eine öffentliche Detailseite tatsächlich konkrete Stelleninformationen zeigt.

## Verlässlichkeit von Pensum und Anstellungsart

In den gespeicherten öffentlichen Rohdaten gibt es nur drei Kombinationen:

- 361 × Vollzeit / 100 %
- 47 × Teilzeit / 60–100 %
- 5 × Praktikum / 60–100 %

Die vor dieser Korrektur vorhandenen Scraper-/Publisher-Standardwerte erklären, warum gefüllte Felder keine Herkunft aus dem Originalinserat beweisen.

Eine konservative textbasierte Auswertung der 413 Quellen findet:

- 151 Inserate mit ausdrücklich erkennbarer Prozentangabe im Titel oder einem Pensumsbereich bzw. beschrifteten Pensum in den ersten 1000 Zeichen des Quelltexts.
- 99 Inserate mit ausdrücklich erkennbarer Anstellungsart im Titel oder Quelltext.
- 33 Inserate mit mindestens 300 Zeichen Quelltext, mindestens zwei Aufgaben und Anforderungen und erkennbarer Pensumsangabe.
- 5 Inserate erfüllen zusätzlich die Erkennung der Anstellungsart.

Diese Zahlen sind **heuristische Vorprüfung**, keine manuelle Bestätigung jedes Inserats. Eine Prozentangabe kann falsch zugeordnet sein; Arrays können allgemeine oder ungeeignete Aussagen enthalten. Die Implementierung muss Werte und Aussagen deshalb nochmals konkret prüfen. Die Zeichenlänge misst Umfang, nicht inhaltliche Vollständigkeit.

## Empfehlung

Für die Startseite nur Inserate freigeben, deren konkreter Einsatzort, Beruf, Pensum, Aufgaben und Anforderungen aus der Quelle belegt und datenschutzgerecht öffentlich darstellbar sind. Fehlende Angaben nicht mit Standardwerten oder allgemeinen Berufsprofilen ersetzen. Eine leere oder kürzere Auswahl ist ehrlicher als scheinbar vollständige Inserate. Firmen-, Kontakt- und Quellenangaben müssen an der bestehenden privaten Grenze bleiben; vollständige Rohtexte nicht ungeprüft öffentlich ausgeben.

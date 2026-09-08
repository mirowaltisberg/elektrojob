# Stellensuche und Qualität der Startseite

Stand: 8. September 2026. Änderungen im isolierten Arbeitsverzeichnis; Freigabe, Build und produktive Browserprüfung erfolgen durch den Hauptagenten.

## Nachgewiesene Fehler und Korrekturen

- Die öffentliche API lieferte vor der Änderung 413 Stellen. `q=jobs` und `q=EFZ` lieferten trotzdem null Treffer. `q=Elektroinstallateur` lieferte 252, `q=Elektroniker` 169 Treffer; jeweils stand fälschlich ein Elektro-Projektleiter an erster Stelle. Ursache war ein umgekehrter Präfixvergleich, der das allgemeine Wort «Elektro» als vollständigen Berufsfilter akzeptierte. Der Vergleich unterscheidet Berufe und behält übliche Wortendungen bei; allgemeine Suchwörter leeren die Suche nicht mehr.
- `loc=ZH` ohne Umkreis lieferte null Treffer, während `loc=Zürich` 87 lieferte. Die Kantonsseiten verwendeten genau diese Abkürzungen. Die Suche löst Kantonscodes und vollständige Kantonsnamen nun gegen die Schweizer Ortsdaten auf. Sie durchsucht den ganzen Kanton; die Oberfläche zeigt entsprechend «Ganzer Kanton» und blendet den Umkreis aus. Ortsvorschläge mit Komma und Postleitzahlen behalten die Umkreissuche. Ortsvorschläge wie «Zürich, ZH» passen auch zu ausgeschriebenen Quellenorten.
- Die Kantonslinks im Footer verwendeten Namen statt der vorhandenen Kürzel. Alle zwölf Footer-Kantone und die vier Fribourg-Links der Berufsübersichten zeigen nun auf vorhandene Routen.
- Zuletzt angesehene Stellen lasen `localStorage` bereits beim ersten Rendern. Bei wiederkehrenden Besuchern wich der Browserinhalt dadurch vom leeren Serverinhalt ab. Die Historie wird erst nach dem Laden des Dokuments eingelesen. Ungültige gespeicherte Einträge werden verworfen; fehlende Clipboard-Berechtigung erzeugt einen verständlichen Hinweis statt einer unbehandelten Ausnahme.
- Die Startseite zeigte serverseitig bis zu 45 Tage alte Stellen, obwohl der Filter 30 Tage anzeigte. Beide verwenden nun 30 Tage. Weitere Ergebnisse unterbrechen keine laufende neue Suche mehr. Mobile Nutzer haben zusätzlich zur automatischen Nachladung eine Schaltfläche; Ladefehler lösen keine endlose automatische Wiederholung aus.
- Berufsübersichten enthielten strukturierte Einträge, die nicht sichtbar waren. Die strukturierte Liste entspricht nun den zwölf sichtbaren Stellen; eine leere Ergebnisliste wird nicht mehr als laufender Ladevorgang beschrieben.

## Auswahl der Startseite

Eine Stelle erscheint auf der Startseite nur mit erkennbarem Beruf, einem ausdrücklich elektrischen Quelltitel, einem Ort aus dem Schweizer Ortsverzeichnis, einem ausdrücklich im Titel oder mit «Pensum» bezeichneten Arbeitspensum, mindestens 300 Zeichen Quellbeschreibung sowie mindestens zwei Aufgaben und zwei Anforderungen aus der Quelle. Diese Texte müssen in der Originalbeschreibung nachweisbar sein und die öffentliche Textprüfung bestehen. Abgebrochene Zeilen, reine Vorteile, Kontakt-/Vermittlertexte und fachfremde Quelltitel qualifizieren keine Stelle für die Startseite.

Die gleiche Auswahl gilt für das erste Serverergebnis, Suchfilter, Ergebniszahl und Nachladen über `homepageOnly=true`. Andere Suchseiten behalten auch unvollständige Stellen; auf deren Detailansicht werden fehlende Angaben ausdrücklich benannt. Generische Berufsprofile werden nicht mehr als Anforderungen einer konkreten Stelle ausgegeben.

Die Prüfung der 413 zuvor öffentlich sichtbaren Stellen ergibt nach der neuen Auswahl 9 Kandidaten. Dies ist eine Momentaufnahme vor der finalen produktiven Browserprüfung. 163 haben ein nachweisbares Pensum; 365 einen eindeutig auflösbaren öffentlichen Ort. Die Sichtprüfung aller vorgesehenen öffentlichen Texte erfolgt separat.

Anstellungsart und Lohn sind optional und werden auf der Startseite bei fehlendem Nachweis ausgeblendet. Es werden keine Ersatzwerte erfunden. Die bisherigen Scraper-, Publisher- und Seed-Vorgaben «Vollzeit», «100%» bzw. «60–100%» wurden entfernt. Pensumsbereiche bleiben erhalten; Rabatte und andere Prozentangaben aus dem Beschreibungstext zählen nicht als Pensum. Vorhandene Datenbankwerte wurden nicht verändert: Die öffentliche Ausgabe prüft stattdessen die vorhandenen Originaltexte. Ein erneutes Scraping ist für die aktuellen qualifizierten Stellen nicht erforderlich.

## Öffentliche Daten und Grenzen

Originaltitel werden weiterhin auf neutrale Berufsbezeichnungen abgebildet. Orte stammen ausschliesslich aus dem Schweizer Ortsverzeichnis; Firmen, Strassen und Kontakte aus einem Quellen-Ortsfeld werden nicht weitergereicht. Arbeitgebernamen, Quell-URLs und vollständige Originalbeschreibungen bleiben auf dem Server. Ganze Aufgaben- oder Anforderungszeilen mit erkennbaren Firmen-, Personen-, Kontakt-, Adress- oder URL-Angaben werden verworfen. Reichen die übrigen Angaben nicht aus, wird die Stelle auf der Startseite ausgeschlossen.

Die konservative Textprüfung reduziert das Risiko und kann auch brauchbare Angaben aussortieren. Sie ist keine Garantie zur automatischen Erkennung jedes denkbaren Namens in zukünftigen Texten. Alle konkret nachgewiesenen Umgehungen sind durch Regressionstests abgedeckt; zusätzlich wird die aktuelle Auswahl vollständig visuell geprüft.

## Prüfung

- 15 Node-Tests bestanden: Berufs-/Ortssuche, Kantonslinks, gespeicherte Historie vor Hydration, Schema und Quelle-/Kontaktgrenzen.
- 4 Python-Tests bestanden: unbekannte Angaben bleiben leer, echte Angaben bleiben erhalten, Pensumsbereiche und unzulässige Prozentangaben.
- Öffentliche Grundinvarianten für die lokale Altdatei mit 2562 Einträgen bestanden; diese Datei vom März ist ausdrücklich kein Nachweis für die aktuelle Stellenzahl.
- Gezieltes ESLint, TypeScript und `git diff --check` bestanden.
- Keine Datenbankänderung, Bewerbung, Nachricht, produktive Veröffentlichung oder Commit durch diesen Unteragenten.

## Gemeinsame Freigabeprüfung

Am 8. September 2026 bestanden 39 Node-Tests und 4 Python-Tests. Der Produktionsbuild mit aktueller Datenbankkonfiguration war erfolgreich. Die separate manuelle Inhaltsprüfung aller neun vorgeschlagenen Startseitenstellen fand keine verbleibenden blockierenden Befunde. Die bestehende öffentliche Fixture-Prüfung bestand für 2562 historische Datensätze; die aktuelle Datenprüfung bezog sich separat auf 413 öffentliche Stellen.

Im lokalen Browser geprüft: Kantonfilter ZH, source-basierte Aufgaben/Anforderungen, mobiles Stellendetail und Bewerbungsdialog ohne horizontalen Überlauf. Die Live-Abnahme folgt nach der Bereitstellung und wird im übergreifenden Marketing-Bericht dokumentiert.

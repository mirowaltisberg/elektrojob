# Prüfung der Google-Werbemessung vom 8. September 2026

## Bestätigter Fehler und Korrektur

Die am 8. September 2026 geprüfte produktive Antwort von `https://www.elektrojob.ch/` enthielt dieselbe Content Security Policy wie `next.config.ts` im Ausgangsstand `cd54c91`. Sie erlaubte das Laden von `gtag.js` und HTTPS-Bildpixel, blockierte aber die Verbindungsziele von Google Ads, weitere Ads-Scripts und sämtliche Frames.

Google führt diese Ressourcentypen ausdrücklich als Voraussetzungen für Ads-Conversions auf. Die CSP wurde deshalb um die dafür dokumentierten Google-Ursprünge sowie `www.google.ch` für die Schweizer Kampagne ergänzt. Script- und Verbindungszugriffe bleiben auf benannte Anbieter beschränkt; Frames sind ausschliesslich von `www.googletagmanager.com` erlaubt. Die Erweiterung erteilt keine Tracking-Einwilligung und lädt selbst keinen Tag. [Google: CSP-Vorgaben für Google Ads](https://developers.google.com/tag-platform/security/guides/csp#google_ads)

Ein erfolgreicher Bildpixel schliesst diesen Fehler nicht aus: Die bisherige Richtlinie behandelte Bilder anders als Verbindungen, Scripts und Frames. Ob die fehlenden Freigaben die konkrete Warnung im Ads-Konto verursachen, ist damit noch nicht bewiesen.

## Unverändert geprüfte Schutzmassnahmen

- Tag `AW-18434284216`, Conversion-Ziel `AW-18434284216/jv6KCMGvs_AcELi1k9ZE` und Account-Zuordnung bleiben unverändert.
- Der zentrale Layout-Baustein stellt den Tag auf Start-, Stellen- und Themenseiten bereit. Bei einer Navigation innerhalb der App bleibt die bestehende Instanz bestehen; das Conversion-Ereignis ermittelt die aktuelle, bereinigte Seitenadresse neu.
- Google-Werbemessung lädt erst nach eigener, ausdrücklicher Einwilligung. Die Voreinstellung ist verweigert; anschliessend werden Werbespeicherung und Werbedatennutzung freigegeben. Personalisierte Werbung und Google-Analytics-Speicherung bleiben verweigert.
- Einwilligung in die eigene Nutzungsanalyse allein aktiviert Google Ads nicht. Widerruf leert ausstehende Conversions, verweigert weitere Ereignisse und entfernt vorhandene `_gcl_`-Cookies. Speicherzugriffsfehler blockieren optionale Messung, nicht die Bewerbung.
- Die separate Ebene `jobsiteAdsLayer` verwendet das dokumentierte `l`-Argument und das gtag-Befehlsformat. Sie wird nicht überschrieben.
- Das aktive Bewerbungsformular meldet nur eine bestätigte Server-Speicherung mit gültiger, anonymer UUID. Fehlerantworten, Öffnen des Formulars und Klicks lösen keine Conversion aus. Dieselbe UUID wird innerhalb der Seiteninstanz nur einmal versendet; `transaction_id` wird an Google mitgegeben.
- Die aktive Formularintegration berücksichtigt die synthetische Server-Kennzeichnung. Zusätzlich verhindert die Bibliothek Messungen auf Vorschau-/Testhosts, bei markierten Tests und automatisierten Besuchen.
- An Google gehen keine Formularfelder, Kontaktdaten oder Lebensläufe. Query-Parameter werden bis auf streng geprüfte Anzeigenklick-Kennungen entfernt; der Referrer wird auf seinen Ursprung gekürzt.

Die Einwilligungsreihenfolge entspricht Googles einfachem Consent Mode. Dass vor einer Zustimmung kein Google-Tag erscheint, ist dabei vorgesehen. Das könnte einen automatischen Erkennungslauf ohne Zustimmung erklären; die Ursache der konkreten Ads-Warnung bleibt offen. [Google: Consent Mode](https://developers.google.com/tag-platform/security/concepts/consent-mode), [Google: eigene Data-Layer-Bezeichnung](https://developers.google.com/tag-platform/tag-manager/datalayer#rename_the_data_layer)

## Prüfung und Grenzen

`src/lib/google-ads-csp.test.ts` prüft die tatsächlich erzeugten Header-Regeln auf die erforderlichen Ressourcentypen und die Begrenzung externer Freigaben. Vor der Korrektur schlug der Test wegen des blockierten Ads-Scripts fehl. Danach bestanden dieser Test und der bestehende Consent-/Conversion-Test. ESLint bestand für Konfiguration, beide Tracking-Module und den neuen Test.

In dieser Teilprüfung wurden keine Bewerbungen erzeugt, keine Produktionsdaten verändert, keine Anzeigen bearbeitet und keine zusätzlichen Conversions gesendet. Die produktive Auslieferung der geänderten Header und eine erneute Prüfung auf CSP-Verstösse gehören zur anschliessenden Veröffentlichung durch den koordinierenden Agenten. Die Freigabe und Statusanzeige im Google-Ads-Konto kann der Code nicht bestätigen.

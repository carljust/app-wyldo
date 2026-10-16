# 2 – Benutzerfluss und Maskenvertrag

## Hauptnavigation
Tab 1 `Entdecken`: Standard nach Login; Questliste in der Nähe + Suchfeld, Filter und Fortsetzen-Kachel.
Tab 2 `Karte`: **Quest-Übersichtskarte**, Quest-Pin-Icon, Popup mit Kurzinfo und Details-CTA; ist NICHT die aktive Questkarte.
Tab 3 `Rucksack`: abgeschlossene/pausierte Quests, Fundstücke, XP, Level, Abzeichen.
Tab 4 `Profil`: Account, Einstellungen, Datenschutz, Audio, GPS, Logout.

In laufender Quest: eigenständiger Quest-Flow mit Zurück/Pause, Karte/Pfeil-Umschalter, Fortschritts-/Stationsstatus. Die Haupttabs müssen nicht permanent eingeblendet werden.

## Verbindlicher vollständiger UX-Pfad
`Anmelden → Entdecken → Questdetails → Navigation zum Start → GPS-Startbereich erreicht → Wyldo-Startdialog mit Taste Quest beginnen → Intro-Animation (überspringbar) → Wyldo-Einführung → Navigation zum nächsten Ziel → GPS-Stationsankunft → Wyldo/Dialog/Aufgabe → Rätsel lösen → ggf. Steinsiegel / XP → Navigation → … → Finale → Abschlussanimation → Zusammenfassung → Rucksack`.

Beim Pausieren: laufendes Kapitel, gelöste Rätsel, GPS-freigeschaltete Stationen, erteilte Hinweise, erhaltene Items und noch nicht synchronisierte Ergebnisse persistieren; Resume zeigt nächste sinnvolle Stelle, ohne Belohnungen doppelt zu vergeben.

## Masken (Screens)
| ID | Maske | Pflichtinhalt / Aktion |
|---|---|---|
| S01 | Auth | Google oder E-Mail-Anmeldung; sicherer Lade-/Fehlerzustand |
| S02 | Entdecken | Standortbasierte Quests mit Suchfunktion, Suchradius, Questkarten, XP/Level-Kopfbereich, begonnene Quests |
| S03 | Questdetails | Titelbild, Storyteaser, Alter, Schwierigkeit, Entfernung vom Nutzer zum Start, Strecke, Dauer, Rewards, CTA `Zum Startpunkt` |
| S04 | Startnavigation Karte | echte Karte, Standort, geprüfter Track wo vorhanden, Startmarker, Distanz, Karten/Pfeil-Schalter, Pause/Abbruch |
| S05 | Startnavigation Richtung | große dynamische Peilung, Luftlinienentfernung, Kompass-/GPS-Status, Wechsel zu Karte, `Auf Wegen bleiben` |
| S06 | Start angekommen | GPS-Genauigkeit geprüft, Wyldo taucht auf; CTA `Quest starten` (nicht automatisch anfangen) |
| S07 | Intro | kurze Animation (überspringbar), Wyldo-Story, Audiooption und Untertitel |
| S08 | Quest-Navigation Karte/Pfeil | gleicher Navigationstyp wie zum Start, aktives Ziel, Kapitel-/Siegelstand, Pause |
| S09 | Station angekommen | Wyldo-Ereignis, Dialogtext, Weiter zur Aufgabe |
| S10 | Rätsel | Antworttyp-spezifische UI, Antwort prüfen, Fehler-Rückmeldung ohne Sackgasse |
| S11 | Hinweise | gestufte Hinweise, zurück zum Rätsel |
| S12 | Stationserfolg | positives Feedback, ggf. Steinsiegel, XP, CTA `Weiter zur nächsten Station` |
| S13 | Quest pausiert/fortsetzen | Pause bestätigen, Resume mit konsistentem Status |
| S14 | Questfinale | Enthüllung Kristall, kurze Animation, Zusammenfassung, XP und Abzeichen |
| S15 | Rucksack | XP-Leiste/Level, Fundstücke, Abzeichen, abgeschlossene und pausierte Quests |
| S16 | Übersichtskarte | Quest-Pins mit Kurzkarte und Details-Link; georeferenzierte Kartenposition |
| S17 | Profil | Anzeigename, Audio/Datenschutz/Account |

## Gemeinsame UI-Zustände
`loading, empty, no-permission, gps-unavailable, gps-inaccurate, offline, download-needed, syncing, retry, error, completed`; bei weiter entfernten Startpunkten kein missverständliches `Quest beginnen` vor Ankunft. Separater GPS-Simulator nur in DEV-Build.

## Pfeilmodus-Regel
Peilung auf das Ziel ist **Luftlinie**; Anzeige nicht als Wegnavigation bezeichnen. Live-Ausrichtung anhand Geräteheading, sofern zuverlässig; Fallback auf bewegungsbasierte Peilung und Kartenmodus. Zielentfernung getrennt von Wegstrecke. GPS-Freischaltung nur bei ausreichender Genauigkeit + Radius + Hysterese; Nutzer erhält verständliche Rückmeldung.

## Quest-Aufgaben / Draußenmodus (V1.1)
Am GPS-Trigger erscheint Wyldo mit einer **konkreten Beobachtungsmission**. Erst danach gehen Kinder wieder mit den Augen nach draußen. UI: kurzer Dialog → großer Button „Umgebung untersuchen“ → minimierte Beobachtungsansicht mit Hinweis → Antwort-Eingabe → Feedback → Siegel → Navigation. Kein stationäres Bildschirmrätsel als Ersatz; Alternativbeobachtung bleibt vor Ort gebunden. Bei fehlender Eindeutigkeit „Ich finde das nicht“ mit sicheren Hinweisen und barrierearmer Alternative.

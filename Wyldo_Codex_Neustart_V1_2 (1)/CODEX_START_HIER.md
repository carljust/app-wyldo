# STARTAUFTRAG AN CODEX – WYLDO NEUBAU V1.2

Du bist Senior React Native/Expo Engineer, Spiel-UX-Designer und Softwarearchitekt. Du arbeitest im **frisch angelegten Repository** `wyldo-app` (nicht `wanderquest`). Die im Repository liegenden Unterlagen und Grafiken sind deine Eingabe. **Implementiere von Grund auf eine neue App; übernimm keine alten Dateien, Styles, UI oder Services aus `wanderquest`.**

## Vor der Implementierung – verpflichtend lesen
- `AGENTS.md`, `README.md`
- ALLE Dateien `docs/master/00_START_HIER.md` bis `docs/master/15_CHANGELOG_V1_2.md`, soweit vorhanden
- `docs/master/quest/externsteine_v1_draft.json`
- alle PNG-Referenzen unter `docs/master/design/fox/` und `docs/master/design/mockups/`
- Geodaten unter `docs/master/geo/` (GPX/GeoJSON und die ungeprüfte Stations-CSV)

V1.2 ergänzt/überschreibt abweichende ältere Anweisungen. Nichts aus einem generierten Mockup als technisch validierten GPS-Fakt ausgeben. Erfinde keine fehlenden Anmeldedaten, Assets, verifizierten Stationen oder Rätsellösungen.

## Produktziel
Wyldo ist ein hochwertiges GPS-Outdoor-**Adventure Game** für Familien. Orangefarbener Fuchs Wyldo mit grünem Schal/Rucksack/Kompass als Markenfigur in Storys, Rätseln und Events. Vier Tabs: **Entdecken, Karte, Rucksack, Profil**. Erste Story `Der verlorene Schatz der Externsteine`: 8 Kapitel, 4 Steinsiegel, Runa, virtueller Kristallschatz. Hauptaufgaben werden **durch Entdeckungen in der echten Umgebung** gelöst, nicht über Wissenstrivia. Die App wirkt wie ein modernes Spiel, nicht wie eine nüchterne Wander-App.

## Jetzt ausführen – NUR PHASE 1 + PHASE 2

### Phase 1 — Sauberes technisches Fundament
1. Richte React Native + Expo + TypeScript + Expo Router in diesem leeren Repo neu ein; aktuelle gegenseitig kompatible Versionen prüfen.
2. Wähle passende Kartenbibliothek für Android/iOS (Web-Demos nur ergänzend), dokumentiere Native-/Expo-Go-Anforderungen und Tile-Lizenzen. Nicht heimlich auf eine schematische Fake-Karte ausweichen.
3. Baue Architektur-/Routing-/Feature-Struktur, Theme Tokens, lokale Fixture-Daten, Typdefinitionen für Questsummary/Details/Route; Supabase später sauber ankoppelbar. SQLite/Offline und serverseitig abgesicherte Questengine im Architekturplan vorsehen, **noch nicht als fertig implementieren**.
4. Berichte begründete Entscheidungen, Risiken und klare Abnahmebedingungen in `docs/implementation/`.

### Phase 2 — Design- und Karten-Prototyp
1. Design möglichst getreu den **tatsächlich beiliegenden** freigegebenen Screenshots in `docs/master/design/mockups/` umsetzen. Nutze den Originalfuchs, beachte dass statische Bilder keine animierbaren Rigs sind.
2. Vier sichtbare Tabs; hochwertige **Entdecken-Seite**, **Questdetails**, **allgemeine Karte** sowie **Startnavigation Karte/Richtung**. Rucksack/Profil dürfen eindeutig als Vorschau/Grundgerüst ausgeführt werden.
3. **WICHTIG KARTENREGEL A:** In der `Karte`-Haupttabkarte PRO QUEST nur **ein Startpunkt-Pin**. Keine Linien, keine Kapitelpins! Pin-Tap öffnet Mini-Quest-Vorschau, von dort Detailseite. Nutze mindestens zwei unterschiedliche Testquests für Interaktionstests; die Externsteine-Quest bleibt UNVERÖFFENTLICHTE Dev-Vorschau, nicht Teil eines simulierten Produktionsfeeds.
4. **WICHTIG KARTENREGEL B:** In den **Questdetails** die **vollständige GeoJSON-/GPX-Route** der konkreten Quest als Linie auf echter Kartenkomponente rendern, nicht eine Luftlinie zwischen Stationen. Fit-to-bounds. Bei Rundweg Start und Ende zu EINEM Start/Zielmarker zusammenfassen. Ungeprüfte Kapitelpositionen/Schatzstationen bleiben verborgen. Für Externsteine Dev-Vorschau am Routenbild `Routenentwurf – noch nicht vor Ort geprüft` anzeigen. Fehlende Route als ehrlich leeren Zustand darstellen.
5. **WICHTIG KARTENREGEL C:** Separate Navigation zum Start mit Umschaltung Karte/Richtung; richtungsbezogene Entfernung klar `Luftlinie`, Warnhinweis `Auf markierten Wegen bleiben`; Live-GPS erst nach Freigabe der Feldstationen. Entwicklungsmodus sichtbar kennzeichnen.
6. Baue sinnvolle UI-Stati für Ladefehler/fehlenden Standort/Offline und nutzbare Touchgrößen. Pro sichtbarem Button echte Navigation/Funktion oder gut sichtbare Deaktivierung.
7. Schreibe gezielte Tests für Karte A/B/C, Draft-Verbergen, Routengeometrie und den gemeinsamen Start/Zielmarker gemäß `docs/master/13_ABNAHME_V1_2.md`.
8. Erstelle **echte Screenshots** (Browser oder Simulator, korrekt benannt) bei 320×640, 360×800, 390×844; dokumentiere Unterschiede zu Mockups, Tests/Befehle, Native-Untested-Lücken und fehlende Ressourcen. Erstelle einen Feature-Branch und Pull Request, sofern GitHub-PR-Berechtigung vorhanden; sonst lokale Diff-/PR-Beschreibung.

## Verbindliche Stop-Bedingung
**NACH DESIGN-/KARTENPHASE UNBEDINGT STOPPEN.** Fordere explizit meine visuelle Freigabe an. Nicht auf eigene Faust Supabase live schalten, Google-Login als angeblich fertig markieren, acht Stationen mit imaginären GPS-Auslösern veröffentlichen, XP verteilen oder Quest-Engine ausbauen.

## Erfolgskriterien
Siehe `docs/master/06_ABNAHME_UND_TESTS.md` und `docs/master/13_ABNAHME_V1_2.md`. Vor allem: neue App statt alter Wiederverwertung; echtes Game-UI; global EIN Pin je Quest; Details mit kompletter Route; verifizierte vs. unverifizierte Daten korrekt getrennt; alles mit Screenshots und nachvollziehbar getesteten Funktionen belegen.

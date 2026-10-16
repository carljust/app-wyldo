# WYLDO — Startpaket für ein NEUES Codex-Projekt (V1.2)

**Projektziel:** Neue, eigenständige Expo/React-Native-App für ein familienfreundliches GPS-Adventure-Game. **Keinen alten Quellcode von `wanderquest` übernehmen.**

## In 5 Schritten starten
1. **Leeres** GitHub-Repository `wyldo-app` anlegen (privat empfohlen); altes `wanderquest` unverändert lassen.
2. **Den gesamten Inhalt dieses ZIPs** ins neue Repo-Stammverzeichnis hochladen/committen (nicht das ZIP selbst, nicht nur `docs/master`).
3. In Codex das neue Repo auswählen und **`CODEX_START_HIER.md`** als ersten Auftrag übergeben.
4. Codex implementiert zunächst **nur Architektur + Design-Prototyp** und liefert Screenshots/Tests + PR.
5. **Designabnahme** durchführen; weitere Phasen erst nach ausdrücklichem Go.

## Inhaltsübersicht
- `CODEX_START_HIER.md`: DIREKT verwendbarer Codex-Startauftrag
- `AGENTS.md`: dauerhafte verbindliche Projektregeln für Coding-Agenten
- `docs/master/`: konsolidierte Produktvision, Flows, Designsystem, Screens, Architektur, Story, Tests, Roadmap
- `docs/master/design/`: **echte mitgelieferte** Mockups und Wyldo-Fuchsreferenzen
- `docs/master/geo/`: originale Nutzer-GPX, vorbereiteter GeoJSON-Track, **unverifizierte** Kapitelpunkt-Tabelle
- `docs/master/quest/`: Quest-Draft, **nicht veröffentlichungsfähig**
- `docs/master/10_KARTENKONZEPT_V1_2.md`: neue, verbindliche Kartenregeln
- `docs/master/11_ROUTEN_UND_STATIONEN_V1_2.md`: GPS-Grundlage, Trennung Route/Station
- `docs/master/12_ENTSCHEIDUNGEN_V1_2.md`: Prioritäten, Widerspruchsauflösung, offene Punkte
- `docs/master/13_ABNAHME_V1_2.md`: konkrete Prüfkriterien für Karten und neues Repo
- `docs/master/14_DATENVERTRAEGE_V1_2.md`: Daten-API für Quest-Pins, Routengeometrie und verborgene Stationen

## Wichtige Trennung
**GPX vorhanden** bedeutet **nicht**, dass die Route im Gelände neu überprüft oder die acht Rätselstationen freigegeben sind. Der Track ist ein vom Nutzer gelieferter Rundweg-Kandidat. Erst Feldbegehung + sichere Sichtpunkte + Fotobelege + Kinder-Tests erlauben `published/outdoor_playable`.

**Mockups** definieren Look & Feel, nicht tatsächliche Kartengeometrie oder funktionsfähige Charakteranimation. Die originalen PNGs sind statische Referenzen.

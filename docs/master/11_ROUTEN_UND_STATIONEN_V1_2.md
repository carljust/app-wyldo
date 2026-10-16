# Externsteine – importierte Wegdaten und Vor-Ort-Validierung

## Verfügbare Dateien
- `geo/kindererlebniswelt-natur-knickenhagen-an-den-externsteinen-oh-6.gpx`: Nutzer-Original, Wanderweg **OH! 6**.
- `geo/wyldo_oh6_route_entwurf.geojson`: vorverarbeitete Track-Geometrie und Entwurfsmarker. **Nicht als freigegebene Stationen ausliefern.**
- `geo/wyldo_oh6_stationsentwurf.csv`: acht rein gleichmäßig nach Trackstrecke ausgewählte Kandidatenpunkte; **keine bestätigten Erlebnisstationen**.

## Nachvollziehbare GPS-Grundlage
- GPX enthält einen Rund-Track mit 218 Punkten, nach vorheriger Haversine-Auswertung ungefähr **2,55 km**.
- Kandidat Start/Ende ca. `51.86905, 8.91786`. **Als Kandidat gekennzeichnet**; exakte sichere Benutzer-Startposition im Gelände überprüfen.
- GPX enthält **keine** namentlich ausgewiesenen Stationen oder Waypoints. Keine geografische Zuteilung von Baumtastpfad, Löns-Stein, Wasser, Felsblick oder Nistkästen ist aus diesen Daten ableitbar.
- Teilweise erwähnte offizielle Naturerlebnisstationen dürfen **nicht** ohne Ortsnachweis automatisch mit interpolierten Kandidatenpunkten gleichgesetzt werden.

## Spielplanung: acht Kapitel (nur redaktionelle Szenarien)
1. Die geheimnisvolle Schatzkarte – realer Orientierungspunkt am sicheren Start.
2. Das erste Steinsiegel / steinerne Wächter – tatsächliche Sicht auf Felsen und eindeutige Form.
3. Waldzeichen – stabile Rinden-/Blatt-/Wegmerkmale entlang des sicheren Weges.
4. Baumhüter – Tastpfad/Baumstrukturen **nur falls wirklich vorhanden und erreichbar**.
5. Runas Botschaft – reale dauerhafte, zugängliche Beobachtung, nicht Nistkasten oder Vogel voraussetzen.
6. Verschwundene Spuren – stabile Wegtafel oder dauerhaftes Merkmal, nicht zufällige Tierfährte.
7. Letztes Geheimnis – vor Ort eindeutige Beobachtung + Kombinationshinweis für Siegel 4.
8. Digitaler Schatzfund – letzter vor Ort sichtbarer Hinweis und sichere Schlussposition.

## Datenstatus — streng getrennt
- `routeSourceStatus = user_supplied_gpx`: geografischer Track vorhanden.
- `routeFieldVerified = false`: Weg nicht von uns vor Ort überprüft.
- `stationFieldVerified = false` für alle 8 Kapitel.
- `stationTrigger = null` für alle 8 Kapitel.
- `quest.published = false`, `quest.outdoorPlayable = false`.
- Kein valider Produktions-Start-/Triggerpunkt oder eindeutig beantwortbares Outdoor-Rätsel kann allein aus GPX bewiesen werden.

## Geländebegehung — Pflichtprotokoll
Für jede Station festhalten: gemessene Position, Fotos aus Kinderaugenhöhe, öffentlicher sicherer Standplatz, Bewegungsradius, saisonale Sichtbarkeit, eindeutige Frage/Antwort, zwei abgestufte Hilfen, barrierearme Ersatzbeobachtung vor Ort, Sicherheitsrisiko, Referenzbild-/Audio-Asset, Datum der Prüfung/Reviewer, Freigabeentscheidung. Die richtige Lösung darf im Produktionsbetrieb nicht offen im Client liegen.

## Entwicklungsfreigabe
GPS-Track für **interaktive Detailkarten-Vorschau** und Simulation verwenden; klar als Entwurf kennzeichnen. Keine automatischen realen Questankünfte oder Veröffentlichung erlauben.

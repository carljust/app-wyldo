# Architektur-/Inhaltsentscheidungen und Prioritäten (V1.2)

## Verbindliche Quellen in Konfliktfällen
1. **Dieses Dokument und V1.2-Ergänzungen** (`10`, `11`, `13`, `14`, `15`) haben Vorrang vor älteren V1.1-Texten.
2. V1.1 unter `00_START_HIER` bis `09_CHANGELOG_V1_1` bleibt fachlich gültig, soweit V1.2 nicht konkret abweicht.
3. Mitgelieferte Mockups beschreiben **Look & Feel**, keine wahren Wegstrecken, GPS-Koordinaten, verifizierten Routen oder freigegebenen Quizantworten.
4. Das ältere `wanderquest`-Repo, frühere Sternenkompass-/Alva-Story und verworfene Fünf-Stationen-Quests sind **keine** Quellen.

## Fixierte Produktentscheidungen
- App UND Fuchs heißen Wyldo. Visuelle Masterreferenz sind die **mitgelieferten** Fuchsgrafiken.
- 4 Tabs: Entdecken / Karte / Rucksack / Profil.
- Quest-Übersichtskarte zeigt **nur einen Startpin je Quest**, niemals die Routengeometrie aller Quests.
- **Quest-Detailseite zeigt komplette Track-Polyline** aus einer echten Quest-Geometrie, und gemeinsamen Start-/Zielpin bei Rundtouren.
- Queststart führt zuerst zur Startnavigation. GPS-Ankunft → Wyldo bittet um **bewussten** Start → Intro → Stationen und Rätsel.
- Story: **Der verlorene Schatz der Externsteine**, acht Kapitel, vier Steinsiegel, Runa der Steinkauz, virtueller Kristallschatz.
- Kinder **suchen Antworten in der realen Umgebung**. Smartphone stellt Aufgabe und nimmt Lösung entgegen; kein normales Wissensquiz.
- Weiterentwicklung: zentrale Supabase-Datenhaltung, SQL RLS, Offline-Cache, XP-Ledger, idempotente Belohnungen. Kein Hardcode von Live-Solutions.
- Charaktersprache als separate Audio-Dateien möglich; fehlende Sprachaufnahmen dürfen Designimplementation nicht blockieren.

## Explizit noch NICHT entschieden / offen
- Endgültige acht genaue GPS-/Trigger-Positionen und nachgewiesene Sichtmerkmale.
- Produktionsfreigabe des vom Nutzer hochgeladenen GPX; Veröffentlichung und Rechts-/Naturschutzaspekte vor Outdoor-Betatest prüfen.
- Tatsächlicher Einstiegsspot (im GPX Startkoordinate kann ein Wegpunkt statt sicherer Treffpunkt sein).
- Definitive Gehzeit/Schwierigkeit/Alter; Modellierung kann Draftwerte zeigen, nie als verifizierte Tatsache.
- Google OAuth-Provider-Credentials, Supabase-Projektkonfiguration und vertragliche Kartennutzung/offline tiles.
- Audio/Animation-Rig; Original-PNG ist keine sprechfähige oder animierbare Datei.
- XP-Balance ist nur ein Entwurf; gewählte Progression dokumentieren und testen.

## Regel für Arbeiten ohne Konfiguration
In Phase 1–2 darf Codex lokal mit klar als solche benannten Fixture-Quests und dev-simuliertem GPS arbeiten, um Screens und UI-Verhalten zu beweisen. Nicht behaupten, OAuth/Supabase/Outdoor funktioniere live. Keine Live-Schlüssel erfinden.

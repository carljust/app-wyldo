# 4 – Technische Architektur

## Zielstack
React Native + Expo + TypeScript; Expo Router; Supabase Auth + PostgreSQL + Storage; expo-location für GPS; geeignete React-Native-Karte (Lizenz und SDK-Kompatibilität prüfen); SQLite für lokale Quest-/Fortschrittsdaten. Servervalidierung via Edge Functions oder gesicherte Serverservices.

## Domänenobjekte
`profiles`, `quests`, `quest_versions`, `quest_routes`, `quest_stations`, `story_events`, `dialog_lines`, `challenges`, `challenge_options`, `hints`, `assets`, `play_sessions`, `station_progress`, `challenge_attempts`, `collectibles`, `user_inventory`, `xp_ledger`, `badges`, `user_badges`, `offline_sync_operations`.

**Typisierte Quest-Engine:** `not_started → navigating_to_start → ready_at_start → intro → navigating_to_station → station_event → challenge → reward → navigating_to_station ... → finale → completed`; orthogonaler `paused`-Zustand / Rückkehr in vorherigen State. Keine stillen Statussprünge.

## Datenregeln
- veröffentlichte Quests zentral, versioniert, per App herunterladbar; neue Quest ohne App-Update.
- `sessionId`, `eventId` und serverseitige eindeutige Constraints sichern gegen doppelte XP/Rewards bei mehrfacher Synchronisierung.
- RLS: Nutzende sehen/ändern nur eigene private Sessiondaten, keine Änderungen an offiziellen Missionen.
- Lösungen von Rätseln **nicht** öffentlich in mobile Payload ausliefern. Für Offline-Rätsel: versionierte verschlüsselte/proof-basierte oder verzögert serververifizierte Prüfstrategie; Missbrauchs-/Integritätsgrenzen dokumentieren, keine angeblich geheimen im Bundle hartcodierten Antworten.
- Login mit Google benötigt echte Provider-Konfiguration (OAuth-Redirects, Expo Development Build); Anmeldemaske darf nicht bloß dekorativ sein.
- kein Service-Role-Token im Client; Publishable Key ist öffentlich vorgesehen; Secrets ausschließlich Backend.

## Karte und GPS
Offiziellen GPX-Track als Basis importieren; Sicherheitsabgleich, tatsächliche Wegpunkte und Vor-Ort-Verifikation erforderlich. GPS-Trigger = bestätigte zugängliche Position auf markiertem Weg. Keine Luftlinien als angebliche Gehroute. Kein Klettern, keine riskanten Uferzugänge, keine Wege durchs Schutzgebiet abseits der Freigabe. Pfeilmodus: Peilung plus Luftlinienentfernung und sichtbarer Hinweis `Auf Wegen bleiben`.

## Offline
Quest-Daten und heruntergeladene Medien lokal verfügbar, Fortschritt in SQLite, Operationen als idempotente Queue nach Login-/Netz-Rückkehr synchronisieren; Konfliktregeln festlegen. Kartenkachel-Offline nur mit passender Lizenz, ansonsten klaren Offline-Fallback mit verifizierten Waypoints/Track anbieten. Der Spieler muss erkennen, ob Quest/Mediendaten komplett offline vorliegen.

## Datenschutz/Sicherheit
Standort nur während aktiver Nutzung mit Einwilligung, keine stille Hintergrundverfolgung; Datensparsamkeit, Lösch-/Exportfunktionen konzipieren; für Kinder Elternkonto/Alters- und Einwilligungsmodell vor öffentlicher Freigabe prüfen. Keine Veröffentlichung ungeprüfter Wegpunkte oder manipulierbarer XP-Endpunkte.

## Ortsbasierter Rätselvertrag (V1.1)
Die Quest-Engine trennt `storyEvent`, `observationTask`, `answerSubmission`, `feedback`, `reward`. Beobachtungsaufgaben besitzen Feldprüfstatus, geprüfte Medien, saisonale Fallbacks und GPS-Trigger. Unverifizierte Entwürfe sind nur in einem expliziten Entwickler-/GPS-Simulationsmodus spielbar. Vor Veröffentlichung muss `fieldValidationStatus=approved` **und** ein sicherer Punkt auf einem geprüften Track vorliegen. Keine festen Antworten in öffentlichen JSON-Dateien; serverseitige Prüfung bzw. dokumentierte Offline-Validierung.

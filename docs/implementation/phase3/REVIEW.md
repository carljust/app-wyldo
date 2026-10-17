# Phase 3 · Supabase/Auth-Grundlagen

**Branch:** `feat/wyldo-supabase-auth`, aufbauend auf dem designfreigegebenen PR #1. **Status:** lokal implementiert und geprüft; Projektmigration vom Nutzer ausgeführt und über echte API-Leseanfragen bestätigt; Login-Abnahme noch ausstehend. Kein produktiver Queststart, keine Quest-Engine und keine XP-Vergabe.

## Implementierung

- Supabase-Client mit ausschließlich öffentlichem Publishable-/anon-Key; serverseitige Schlüssel werden als Clientkonfiguration abgelehnt.
- E-Mail-Magic-Link und Google-OAuth-Codepfad mit PKCE, genauer Callbackprüfung, Fehler-/Ladezuständen, explizit gesperrtem unkonfiguriertem Google-Provider und Abmeldung.
- Session-Provider mit Wiederherstellung und Native-AppState-Refresh; Expo SecureStore für native Sitzungen, Web-localStorage. Auf nativen Plattformen CSPRNG und SHA-256 über Expo Crypto, kein bewusst zugelassener Math.random-/Plain-PKCE-Fallback. Tatsächliches Native-Sessionverhalten ist noch nicht auf Geräten abgenommen.
- Separater Supabase-Repositoryadapter und asynchrone Catalog-/Detailhooks. Bei Konfiguration echte Abfragen, keine stillen Fixture-Fallbacks nach Serverfehlern. Summary-Projektionen enthalten keine Routengeometrie oder Stationsdaten. Routenantworten werden auf Freigabe, GeoJSON-Form und Koordinaten geprüft.
- Atomare PostgreSQL-Migration: Profile, Questversionen, Routen, Assets, private Kandidatenstationen, private Sessions, unveränderliches Client-XP-Ledger und Outbox-Grundstruktur. RLS, Profilerstellung für neue/bestehende Konten, Datenbankconstraints für Replay/Identitätszuordnung und Publikation. Keine Reward-RPC oder Fortschrittsmutationen für Clients.
- Privater Storage-Bucket mit Zugriff ausschließlich auf freigegebene Assets veröffentlichter Questversionen; keine Client-Uploadpolicy. Storage-HTTP-Dienst und echte Dateien noch nicht getestet.
- Read-only Preflight für ein vorhandenes Projekt; neue interne Objekte im eigenen Schema `wyldo_private`. Bei Kollisionen keine Altobjekte ersetzen oder löschen.

## Tatsächlicher Projektzustand

Mit dem bereitgestellten öffentlichen Key nur lesend geprüft:

| Prüfung | Ergebnis |
| --- | --- |
| Supabase Auth-Settings | HTTP 200; E-Mail aktiv; Google aus; Registrierung erlaubt |
| `quest_summaries`, `quests`, `quest_routes` | Nach Nutzer-Migration jeweils HTTP 200, 0 Zeilen; noch keine veröffentlichten Quests |
| `profiles` ohne Nutzeranmeldung | HTTP 401 / 42501, anonymer Zugriff abgewiesen |
| App nach Migration | Ehrlicher leerer Katalog; kein Fehler und keine Fixture-Quests im echten Feed. Früheren Schemafehler separat simuliert geprüft |
| Client-Schreibaktionen gegen das Projekt | Keine durch den Agenten ausgeführt, keine Testmails versandt |

Ein Publishable Key ist ausreichend für die App, aber nicht zum Ausführen von DDL. Der Nutzer hat Preflight und Migration erfolgreich ausgeführt. Die anschließenden echten REST-Aufrufe bestätigen den neuen Zustand. Noch offen sind echte Login-Sessions; siehe [SETUP.md](SETUP.md).

## Validierung

| Befehl | Ergebnis |
| --- | --- |
| `npm run typecheck` | Erfolgreich |
| `npm test` | 19 Tests bestanden, 0 übersprungen |
| `npm run test:db` | Echte PostgreSQL-17-Integration bestanden: Preflight, Migration, Profilbackfill/-trigger, zwei Nutzeridentitäten, RLS, Draft-/Stationsschutz, Storagepolicy, Mutationsverbote, Replayconstraints, sichere Publikation |
| `npm run test:fixture-ui` | 45 vorhandene Browserchecks und Auth-Konfigurations-/Callbackprüfungen bei 320×640, 360×800, 390×844 bestanden; 30 Baseline- und 9 Auth-Screenshots |
| `npm run test:backend-ui` | Konfigurierte E-Mail-UI, gesperrtes Google, echter leerer Katalog, separat simuliertes fehlendes Serverschema und Verzicht auf Fixture-Fallbacks bei drei Viewports geprüft; 0 Remote-Schreibanfragen; 9 Screenshots |
| `npm run format:check`, `git diff --check` | Erfolgreich |
| Webexport und iOS-/Android-JS-/Hermes-Exports | Erfolgreich, keine native Binary-/Gerätezusage |
| `node scripts/production-check.mjs` gegen Webexport | 3/3 Sperrprüfungen bestanden (Draft/Simulation nicht öffentlich) |

Der lokale DB-Harness verwendet PostgreSQL ohne Hostport und Netzwerk, mit echten RLS-Rollen und schreibgeschützten Clientrechten. Er simuliert `auth.uid()` über getrennte JWT-Subjects und minimale Auth-/Storage-Tabellen. Das ist **kein** vollständig gestarteter Supabase-Auth-/Storage-Stack und kein Nachweis echter Google-Sessions. Die SQL-Tests sind lokale Fixtures; nicht im vorhandenen Projekt ausführen.

Ein erster DB-Starttest traf auf den temporären Unix-Socket während der PostgreSQL-Initialisierung. Der Runner prüft jetzt die finale TCP-Readiness innerhalb des netzisolierten Containers. Die korrigierte Prüfung ist erfolgreich. Für Fixture-Screenshots müssen lokale Backendvariablen sauber isoliert werden: Der Testhelfer sichert/restauriert `.env.local` und seine eigenen Serverprozesse; parallel gestartete Metro-Instanzen mit unterschiedlichen Konfigurationen im selben Checkout werden vermieden. Keine Tests abgeschwächt oder unbelegte Erfolgsbehauptungen aus fehlgeschlagenen Läufen übernommen.

## Screenshots

| Zustand | 320×640 | 360×800 | 390×844 |
| --- | --- | --- | --- |
| Ohne Konfiguration | [Screenshot](screenshots/320x640-anmelden-ohne-konfiguration.png) | [Screenshot](screenshots/360x800-anmelden-ohne-konfiguration.png) | [Screenshot](screenshots/390x844-anmelden-ohne-konfiguration.png) |
| Deaktiviertes Formular | [Screenshot](screenshots/320x640-anmeldeformular.png) | [Screenshot](screenshots/360x800-anmeldeformular.png) | [Screenshot](screenshots/390x844-anmeldeformular.png) |
| Ungültiger Link | [Screenshot](screenshots/320x640-ungueltiger-anmeldelink.png) | [Screenshot](screenshots/360x800-ungueltiger-anmeldelink.png) | [Screenshot](screenshots/390x844-ungueltiger-anmeldelink.png) |
| Mit Projektkonfiguration | [Screenshot](screenshots/320x640-anmelden-konfiguriert.png) | [Screenshot](screenshots/360x800-anmelden-konfiguriert.png) | [Screenshot](screenshots/390x844-anmelden-konfiguriert.png) |
| Simulierter Schemafehler | [Screenshot](screenshots/320x640-fehlendes-server-schema.png) | [Screenshot](screenshots/360x800-fehlendes-server-schema.png) | [Screenshot](screenshots/390x844-fehlendes-server-schema.png) |

| Echter leerer Katalog | [Screenshot](screenshots/320x640-leerer-server-katalog.png) | [Screenshot](screenshots/360x800-leerer-server-katalog.png) | [Screenshot](screenshots/390x844-leerer-server-katalog.png) |

## Offene Abnahme

- Migration und anonyme API-Lesezugriffe sind bestätigt. Zwei echte getrennte Testkonten noch prüfen.
- Redirects konfigurieren, echte Magic-Link-Zustellung und Session nach App-/Browserneustart prüfen.
- Google im Supabase-Projekt aktivieren, Google-Console-Callback einrichten und danach den echten Native-OAuth-Flow testen.
- Native Development Builds, Maps SDK-Key, SecureStore-Speichergrenzen, Geräte-/Screenreaderprüfung stehen aus.
- Offline-Download, SQLite-/Sync-Queue, serverseitige Rewardbefehle und Quest-Zustandsautomat gehören zu Folgephasen. Ledgerconstraints sind kein fertiger manipulationssicherer Rewardservice.
- Die Externsteine-Route bleibt unverifiziert; keine Freigabe von acht Stationen oder Outdoor-Spielbarkeit.

Die neue Auth-Maske verwendet das freigegebene Theme und den Originalfuchs; es existiert dafür keine zusätzliche pixelgenaue Mastermaske. Supabase-Fehlerzustände und fehlende Providerkonfiguration werden sichtbar gemacht. Produktionspublikation ist nicht erfolgt.

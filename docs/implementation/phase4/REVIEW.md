# Phase 4 – Navigation und gespeicherter Zustand

Stand: 17.10.2026. Branch `feat/wyldo-navigation-state`, aufbauend auf `feat/wyldo-supabase-auth` (PR #2). Phase 1–3 und Fortsetzung wurden vom Nutzer freigegeben. Masterpaket V1.2 bleibt unverändert.

## Verhalten

Eine Navigation wird vor jeder UI-Fortschaltung lokal gespeichert. Pause, Questversion, öffentliche Quest-/Routendaten und aktueller Zustand überleben einen Neustart. Der Rucksack bietet Fortsetzen. Simulation und angemeldete Nutzer haben getrennte Speicherbereiche. Beschädigte oder fremde Datensätze führen zu einem sichtbaren Fehler, nicht zum stillen Überschreiben.

Zustände: Startnavigation → stabile Ankunft → bewusster Start → kurzer Storyeinstieg → Warten auf freigegebenes Ziel. Stationsnavigation/-ereignis sind als Datenverträge vorbereitet; ohne freigegebene Ziele endet dieser Ablauf nach dem Intro. Keine Rätselantworten, Siegel, Kapitel-Engine oder XP-Vergabe. Der originale statische Wyldo begleitet den Einstieg; es wird keine Animation oder Sprachaufnahme behauptet.

Ankunft benötigt drei genaue Messungen über mindestens sechs Sekunden. Genauigkeit maximal 25 m, Messung maximal 15 Sekunden alt, Genauigkeitskreis vollständig im 30-m-Startbereich. Doppelte Zeitstempel, ungenaue und zukünftige Messungen schalten nicht frei. Hysterese stabilisiert den Rand; bewusster Start prüft die Frische erneut. Nach Pause muss eine Startankunft erneut bestätigt werden.

Live-GPS fragt erst nach ausdrücklicher Aktivierung um Vordergrundberechtigung. Voraussetzung: Anmeldung, veröffentlichte Quest und Version, feldgeprüfte Route, Outdoor-Freigabe und passende aktuelle Online-Version. Kein Hintergrundtracking. Bei Verlassen der Ansicht, Appwechsel und Pause werden Beobachter entfernt. Fehlende Kompassdaten werden als solche gekennzeichnet. Externsteine bleibt ungeprüfte Dev-Simulation, ohne echte Ortung und ohne Upload.

## Architektur und Synchronisierung

- Zod-validierter Zustandsautomat mit expliziten erlaubten Übergängen.
- Native: Expo SQLite; Web: IndexedDB, um keinen SQLite-WASM-/Cross-Origin-Isolation-Zwang einzuführen. Beide verwenden atomare Zustand-/Beleg-/Outbox-Transaktionen, erwartete Revision und dauerhaft gleiche Operations-IDs bei Wiederholungen.
- Gespeicherter Snapshot enthält nur öffentliche Questdaten und die bereits sichtbare Route. Folgeziele werden nicht eingeblendet.
- Checkpoints übertragen nur Sitzung, Questversion, Revision, Zustand und Pause; keine Standortspur, Antworten oder XP. GPS-/Kompassmessungen werden lokal gespeichert, erzeugen aber keine Uploads.
- RPC bindet Anmeldung und angegebenen Eigentümer, prüft Freigabe/Route und schützt Sitzung und Operations-ID gegen fremde Nutzer. Identischer Retry erhält denselben Beleg; verändertes Replay wird abgewiesen. Ältere Revisionen überschreiben keinen neueren Stand.
- Checkpoints bleiben **unvertrauenswürdige Client-Metadaten**. Sie beweisen keine echte Ankunft und berechtigen zu keiner Belohnung. Kein Geräte-übergreifendes Herunterladen/Wiederherstellen in diesem Paket.
- Ohne Anmeldung, Netz oder neue RPC bleibt die Outbox erhalten. Automatischer Retry im Vordergrund, begrenztes exponentielles Backoff; manuelles Synchronisieren löst keinen Datenverlust aus.

## Nachweise

Ausgeführte Prüfungen am 17.10.2026: Browsernachweise in [ui-results.json](ui-results.json), echte Screenshots unter [screenshots](screenshots/). Jeweils 320×640, 360×800, 390×844:

| Ansicht | 320 | 360 | 390 |
|---|---|---|---|
| Gespeicherte Richtung | [PNG](screenshots/320x640-navigation-gespeichert.png) | [PNG](screenshots/360x800-navigation-gespeichert.png) | [PNG](screenshots/390x844-navigation-gespeichert.png) |
| Bewusster Start | [PNG](screenshots/320x640-ankunft-bestaetigen.png) | [PNG](screenshots/360x800-ankunft-bestaetigen.png) | [PNG](screenshots/390x844-ankunft-bestaetigen.png) |
| Pause nach Neustart | [PNG](screenshots/320x640-pause-nach-neustart.png) | [PNG](screenshots/360x800-pause-nach-neustart.png) | [PNG](screenshots/390x844-pause-nach-neustart.png) |
| Intro | [PNG](screenshots/320x640-intro.png) | [PNG](screenshots/360x800-intro.png) | [PNG](screenshots/390x844-intro.png) |
| Fortsetzen im Rucksack | [PNG](screenshots/320x640-rucksack-fortsetzen.png) | [PNG](screenshots/360x800-rucksack-fortsetzen.png) | [PNG](screenshots/390x844-rucksack-fortsetzen.png) |
| Offline warten | [PNG](screenshots/320x640-offline-wartet-auf-freigabe.png) | [PNG](screenshots/360x800-offline-wartet-auf-freigabe.png) | [PNG](screenshots/390x844-offline-wartet-auf-freigabe.png) |

## Abweichungen und offene Abnahmen

Die Navigation übernimmt Farben, Kompass und originalen Fuchs aus dem freigegebenen Design; technische Simulationssteuerung und Speicherstatus ergänzen die Mockups nur im Entwicklungsablauf. Kleine Displays scrollen vertikal. Kein neues Animator-Rig, Audio oder erfundene Landmarken.

Offline ist der lokale Zustand samt gestarteter Quest verfügbar; noch kein vollständiger Katalogcache, keine garantierten Offline-Kacheln und kein Web-App-Shell-Service-Worker. Ein kalter Web-Neustart ohne Netz wird nicht als unterstützt behauptet.

Native Exports prüfen JavaScript/Hermes, keine Binärbuilds oder echte Sensoren. Gerätetest für GPS, Berechtigungen, Kompass, SQLite-Neustart und Maps-SDK bleibt offen. Reale Anmeldung/Magic-Link-Sitzung und authentifizierter Live-Sync sind nicht abgenommen. Gehosteter Katalog bleibt leer, Google deaktiviert. Neue Migration noch nicht gehostet eingespielt; keine fiktive Freigabe der Externsteine. Stationsfreigaben, Feldprüfung und Phase 5 sind weiterhin offen.

## Testergebnisse

| Befehl | Ergebnis |
|---|---|
| `npm run typecheck` | bestanden |
| `npm test` | 34/34 bestanden, keine übersprungen |
| `npm run format:check` | bestanden |
| `npm run test:db` | Foundation und Phase-4-Migration angewandt; beide echten PostgreSQL-Sicherheitssuiten bestanden |
| `npm run test:navigation-ui` | 3/3 Viewports bestanden, 18 Screenshots, keine Laufzeitfehler, kein Simulations-GPS/Upload |
| `npm run test:backend-ui` | 3/3 Viewports: echter leerer Katalog, Google deaktiviert, Fehlerdarstellung; keine Remote-Schreibzugriffe |
| `npm run test:fixture-ui` | 45/45 Karten-/UI-Prüfungen und 3/3 Auth-Fehlerzustandsabläufe bestanden; Konfiguration restauriert |
| `EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 npm run build:web` | bestanden |
| `node scripts/production-check.mjs` gegen Webexport auf 8082 | 3/3 Draft-/Simulationssperren bestanden |
| `EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 npx expo export --platform ios --platform android --output-dir /tmp/wyldo-phase4-native-export` | beide Hermes-Exports bestanden; kein nativer Gerätebuild |

SQLite-Tests verwenden eine echte temporäre Node-SQLite-Datenbank: Close/Reopen, atomarer Rollback bei Outbox-Fehler, Scope-Trennung, Revisionen und idempotente Wiederholung. Das ersetzt keinen Expo-SQLite-Gerätetest. Browser prüft den echten IndexedDB-Adapter über Reload und eine neue Seite. SQL prüft zwei authentifizierte Rollen mit echten PostgreSQL-RLS-Regeln, jedoch lokalen Auth-Stubs.

Die erste Regression fand eine sofortige Kompass-Assertion vor Abschluss der neuen asynchronen Speicherung; die Prüfung wartet jetzt auf die sichtbare Änderung. Der vollständige Wiederholungslauf bestand. Die alten Navigations-/Rucksack-Screenshots unter `docs/implementation/screenshots/` wurden ebenfalls aktualisiert. Bekannte nicht blockierende Exportwarnungen: ungenutzte Leaflet-CSS-Standardbildpfade und DevTools-Cache im schreibgeschützten Benutzerverzeichnis. Echte OSM-Kacheln wurden mit aktiver TLS-Prüfung geladen.

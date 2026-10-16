# Wyldo

Eigenständiger React-Native-/Expo-Neubau nach **Masterpaket V1.2**. Aktueller Umfang: Phase 1–2, Architektur und Design-/Kartenprototyp. Kein Code aus `wanderquest`.

## Start

Node.js 24 und npm 11 wurden hier verwendet. Die installierte Expo-SDK-58-Kompatibilitätsmatrix bestimmt React-/Native-Versionen; `package-lock.json` bindet die konkrete Installation.

```sh
npm ci
npm start
# oder Browser als ergänzende Designprüfung
npm run web
```

In der Cloud mit schreibgeschütztem Benutzerverzeichnis:

```sh
npm --cache /tmp/wyldo-npm ci
EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 npm_config_cache=/tmp/wyldo-npm npm run web -- --host localhost --port 8081
```

`EXPO_OFFLINE=1` vermeidet Expo-CLI-Netzwerkabfragen; es deaktiviert keine TLS-/Paketprüfung und simuliert keinen Offlinebetrieb der App. Metro kann eine nicht blockierende DevTools-Installationswarnung ausgeben. Die App benötigt keine Secrets für die lokale Vorschau.

## Prüfungen

```sh
npm run typecheck
npm test
npm run format:check
EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 npm run build:web
# JavaScript-/Hermes-Exports, keine nativen Binärbuilds:
EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 npx expo export --platform ios --platform android --output-dir /tmp/wyldo-native-export
# Separat laufender Web-Devserver auf Port 8081, Chromium erforderlich:
npm run test:ui
```

`WYLDO_CHROMIUM` und `WYLDO_TEST_URL` passen Browserpfad und Testziel an. Die UI-Prüfung überschreibt ihre eigenen Screenshots und Ergebnisdateien in `docs/implementation/`.

## Karten und Freigabegrenzen

- **iOS/Android:** `react-native-maps`, plattformeigene MapView + OpenStreetMap-Rasterkacheln. **Web:** Leaflet, echte interaktive georeferenzierte Karte.
- Native Development Builds mit SDK-kompatiblen nativen Modulen verwenden. Expo-Go-Unterstützung der konkreten SDK-Version wurde nicht geprüft. Android benötigt einen korrekt konfigurierten Google-Maps-SDK-Key für die zugrunde liegende MapView, auch bei `mapType="none"`; iOS nutzt Apple MapKit. Kein Key wurde erfunden oder eingebaut.
- Online-Tiles: `tile.openstreetmap.org`. Sichtbare OSM-Attribution; keine Massendownloads, kein Offline-Kachelpaket. OSM-Daten: ODbL; Tile-Nutzungsregeln: https://operations.osmfoundation.org/policies/tiles/. Vor Produktivbetrieb einen geeigneten Tile-Anbieter und Nutzungsvertrag festlegen.
- Global: zwei **fiktive Testquests**, je ein Startpin, keine Tracks. Externsteine ist kein veröffentlichter Feed-Eintrag.
- Externsteine nur im Dev-Build: kompletter unverifizierter 218-Punkte-GPX-Track, ein Start/Ziel-Kandidat, keine Stationsmarker.
- Startnavigation ist ausdrücklich **Simulation**, keine Ortungsberechtigung, kein Live-GPS, kein Outdoor-Queststart.
- Quest-Metadaten und Routengeometrie liegen lokal im Bundle. Kein SQLite-Fortschritt, kein Sync, keine Offline-Kachelgarantie; Web-Neuladen ohne Netz benötigt später einen separaten App-Shell-Cache.

## Verbindliche Quellen und Review

Das hochgeladene Paket wurde in die vorgesehenen Rootpfade verschoben: [AGENTS.md](AGENTS.md), [CODEX_START_HIER.md](CODEX_START_HIER.md), [docs/master](docs/master/). Die Masterinhalte und Originalgrafiken bleiben unverändert.

Architektur, Einschränkungen, Screenshotvergleich und Prüfergebnisse: [docs/implementation/REVIEW.md](docs/implementation/REVIEW.md).

**STOP nach Phase 2. Keine Quest-Engine oder produktive Backendanbindung vor ausdrücklicher Designfreigabe.**

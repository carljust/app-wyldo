# Designprüfung · Wyldo Phase 1–2

**Stand:** 17.10.2026 · **Branch:** `feat/wyldo-design-v12` · **Basis:** `d15cd71` (Masterpaket V1.2). **Implementierungscommit:** `65986c8`. **PR:** [#1](https://github.com/carljust/app-wyldo/pull/1), offen; Feature-Branch erfolgreich gepusht.

**Status:** Phase 1–2 vom Nutzer visuell freigegeben. Die dauerhafte Aufnahme der bereitgestellten Cloud-Proxy-CA wurde ebenfalls ausdrücklich genehmigt. Echte OSM-Basiskarten werden jetzt im Browser mit aktiver TLS-Prüfung geladen; Screenshots aktualisiert. Kein Backend, keine Quest-Engine, keine produktive Station und keine Belohnungsvergabe implementiert. Native Geräte- und Outdoor-Freigaben bleiben offen.

## Geliefert

Eigenständige Expo-/TypeScript-App mit Router, vier Tabs, Theme und Komponenten; originale Wyldo-Pose aus der unveränderten transparenten Referenz. Suche mit Leerzustand, expliziter lokaler Testkatalog, isolierte Dev-Vorschau der Externsteine. Echte native MapView und ergänzender Leaflet-Webadapter. Ein Startpin je Testquest, Pin-Vorschau mit korrektem Detailziel, zoomabhängige Clusterfunktion. Externsteine-Detailkarte mit allen 218 GPX-Punkten, einem Start/Ziel-Kandidaten und Entwurfswarnung. Fehlende Routen bleiben leer. Separate Startnavigation mit Karte/Richtung, mathematischer Luftlinienpeilung anhand klar simulierter Position/Heading, Fehlstandortzustand und Pause/Fortsetzen. Profil/Rucksack als ausdrücklich beschriftete Grundgerüste.

Das hochgeladene Paket wurde aus seinem ZIP-Ordnernamen nach `AGENTS.md`, `CODEX_START_HIER.md`, `docs/master/` verschoben. Alle 32 Originaldateien bleiben inhaltlich unverändert; Paket-README jetzt `docs/master/PACKAGE_README.md`. Es wurde kein anderes Repository gelesen oder als Quelle verwendet.

## Nachweise

| Befehl | Tatsächliches Ergebnis |
| --- | --- |
| `npm --cache /tmp/wyldo-npm ci` | Erfolgreich; wiederholbare Installation, Lockfile unverändert |
| `npm run typecheck` | Erfolgreich, keine TypeScript-Fehler |
| `npm test` | **12/12** Tests bestanden, 0 übersprungen |
| `npm run format:check` | Erfolgreich; Formatprüfung, kein semantischer Linter |
| `CI=1 EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 npm run build:web` | Produktions-Webexport erfolgreich |
| `CI=1 EXPO_NO_TELEMETRY=1 EXPO_OFFLINE=1 npx expo export --platform ios --platform android --output-dir /tmp/wyldo-native-export` | Beide Hermes-/JS-Exports erfolgreich; keine nativen Binärbuilds |
| `npm run test:ui` gegen laufenden Devserver | **45/45** Browserprüfungen bestanden; keine Browser-Runtimefehler; 30 aktualisierte Screenshots, einschließlich geladener OSM-Basiskarten |
| `node scripts/production-check.mjs` gegen lokal bedienten `dist`-SPA-Export | **3/3** Browserprüfungen bestanden: kein Draft im Discovery, direkter Draftlink gesperrt, Simulation gesperrt |
| `git diff --check` | Keine Whitespacefehler |

UI-Protokoll: [ui-results.json](ui-results.json). UI-Tests prüfen erfolgreiche echte Tile-Antworten ohne OSM-Blockheader und geladene Rasterbilder bei allen drei Viewports, die unabhängige Auswahl beider Questpins, leere Routen, nur einen gemeinsamen Start/Zielpin, vorhandenen GPX-Pfad, Luftlinie, Headingänderung, Pause/Fortsetzen, fehlenden Standort, Kachelfehler und horizontale Überläufe. Offline-Prüfung betrifft lokal vorhandene Questdaten bei **gesperrten Tile-Anfragen**, nicht vollständiges Web-Neuladen ohne Netzwerk und nicht Offline-Kachelpakete.

### Bekannte Installations-/Buildhinweise

- Expo Online-Kompatibilitätsdienst durch Proxy nicht erreichbar; SDK-eigene Versionstabelle und npm-Lockfile verwendet. Keine TLS-/Signaturprüfung abgeschaltet.
- DevTools versucht in das schreibgeschützte Home-Verzeichnis zu schreiben und nutzt anschließend erfolgreich den mitgelieferten Fallback. App/Metro bleiben lauffähig.
- Leaflet-CSS referenziert ungenutzte Standardmarker-/Layerbilder, deren relative CSS-URLs Metro beim ersten Export nicht verarbeitet. Unsere eigenen Div-Marker und Zoom-/Attributionscontrols funktionieren ohne diese Bilder.

## Screenshotvergleich und Designabweichungen

| Referenz | Umsetzung / bewusste Abweichung |
| --- | --- |
| `01_entdecken.png` | Waldgrün/Gold/Creme, Originalfuchs, Hero, Suche, Questkarten, vier Tabs. Eigene skalierbare Vektorlandschaft statt fehlender separater fotorealistischer Cover; keine Raster-Mockups als fertige Oberfläche. Text bleibt separat. Kein erfundener Level-/XP-Stand, kein dekorativer Benachrichtigungsbutton. |
| `02_quest_details.png` | Originalfuchs, Story, 8 Kapitel/4 Siegel, komplette echte Trackgeometrie, Safety und Navigations-CTA. Angaben zu Gehzeit, Schwierigkeit und Alter werden nicht aus Bildtext als freigegebene Daten übernommen. XP nicht vergeben. Vertikales Scrolllayout statt alles auf einen Bildschirm zu quetschen. |
| `03_navigation_richtung.png` | Goldene Kompassnadel und Distanz, Karte/Richtung, klare Warnung, echte Berechnung aus simulierten Daten. Keine behaupteten Gehminuten, Wegqualität, fiktive Live-Ankunft oder Querfeldeinroute. Kleine Displays benötigen Scrollen; zusätzliche Distanz-Screenshots zeigen den Hauptinhalt. |
| `04_storyboard_gesamt.png` | Nur die Navigation und der Look sind Umfang von Phase 2. Ankunft, Intro, Rätsel, Siegelfund, Finale und XP-Szenen bleiben ausdrücklich unimplementiert. |

Die Vektorlandschaft ist eigene dekorative Prototypgrafik, kein geografischer Nachweis und keine fertige Produktiv-Coverlieferung. Verbindliche Wyldo-Grafik wird unverändert verwendet, durch View-Clipping auf eine Originalpose begrenzt. Keine erfundene Fuchsfigur und keine behauptete Rig-/Sprachanimation. Holzlogo, detaillierte Natur-Cover, separate Siegel-/Kristallassets und finale Display-Schrift brauchen noch eine eigene visuelle Entscheidung/Assetproduktion. Die aktuelle klarere, weniger texturreiche Umsetzung ist **zur Prüfung**, nicht als pixelgetreu abgenommen markiert.

## Offene Punkte und konkrete Blocker

1. **Kartenkacheln – behoben:** Die Domainfreigabe ist wirksam. Nach ausdrücklicher Nutzerzustimmung wurde die vom Cloudsystem bereitgestellte `environment-proxy-ca.crt` per `certutil -A` für Chromiums NSS-Speicher zugelassen. Zertifikatsfingerprint gegen die bereitgestellte CA geprüft; NSS führt denselben Zertifikatsinhalt unter `OpenAI-nebula-dns`. Schreibzugriff auf `/home/agent/.pki/nssdb` war für die wirksame Einrichtung erforderlich. Kein Abschalten oder selektives Umgehen der TLS-Prüfung. Browser-Tileantworten: HTTP 200 ohne `x-blocked`, tatsächlich geladene Rasterbilder und visuell geprüfte OSM-Basiskarte. Die frühere automatische Ablehnung wurde durch die explizite Zustimmung des Nutzers aufgelöst. Separate Fehler-Screenshots werden nun gezielt mit abgebrochenen Tile-Anfragen erzeugt; reguläre Karten-Screenshots zeigen die geladene Karte.
2. **Pull Request:** Die anfängliche GitHub-API-Netzwerksperre ist behoben. [PR #1](https://github.com/carljust/app-wyldo/pull/1) wurde tatsächlich erstellt und sein Status `OPEN` per API bestätigt. Branch und Commit sind remote verifiziert. Beschreibung auch in [PR.md](PR.md).
3. **Native Tests:** Keine iOS-/Android-Simulatoren/Geräte und keine signierten Development Builds geprüft. Android-Maps-Key/SDK-Einrichtung, native Kachelfailure-Zustände, Zoomclustering, Touch, Safe Areas und Rendering auf Geräten sind offen. Expo Go nicht als unterstützt bestätigt.
4. **Live-Funktionen:** GPS/Kompass nur Simulation; `expo-location`-/Berechtigungsintegration erst nach späterer Freigabe. Kein Feldcheck, keine bestätigten Stationen, kein sicherer Produktivstart. Der importierte Track misst ca. 2,55 km, beweist aber keine sichere Wegführung oder Sichtmerkmale.
5. **Offline/Backend:** Metadaten und Track im lokalen App-Bundle; SQLite, Mediacache, App-Shell-Offline für Web, serverseitiger Sync und Quest-Engine sind geplant, nicht implementiert.
6. **Offene Produktfragen:** finale Cover/Texturgrad und Typografie; Tile-Anbieter/Lizenz für Produktion und Offline; finale Alter-/Dauer-/Schwierigkeitsfreigabe; acht Feldstationen und Medien. Keine dieser offenen Entscheidungen wird durch Mockupdetails oder GPX-Samples ersetzt.

Die Domains `tile.openstreetmap.org` und `api.github.com` sind im Cloud-Konfigurationsentwurf ergänzt. Die laufende Instanz hat die Domainfreigabe übernommen; die Browser-Zertifikatsfrage ist nach ausdrücklicher Zustimmung behoben. `install_script` (npm ci, TypeScript, Domänentests) und `start_skill` (Devserver, Readiness und Freigabegrenzen) sind ebenfalls gespeichert; das veröffentlicht noch keinen Cloud-Snapshot. Gespeicherte Installations-/Startanweisungen und Veröffentlichung des Cloud-Snapshots sind getrennt von App-Designfreigabe und Produktveröffentlichung.

## Screenshotgalerie

Alle Dateien sind echte Chromium-Aufnahmen der Expo-Web-App mit jeweils exakt benanntem Viewport. Keine Mockups und keine Bildmontagen. Siehe [screenshots](screenshots/); Die regulären Kartenbilder zeigen geladene OSM-Kacheln; nur die ausdrücklich benannten Kachelfehler-Screenshots zeigen den simulierten Fehlerzustand.

| Ansicht | 320×640 | 360×800 | 390×844 |
| --- | --- | --- | --- |
| Entdecken | [Screenshot](screenshots/320x640-entdecken.png) | [Screenshot](screenshots/360x800-entdecken.png) | [Screenshot](screenshots/390x844-entdecken.png) |
| Questdetails | [Screenshot](screenshots/320x640-quest-details.png) | [Screenshot](screenshots/360x800-quest-details.png) | [Screenshot](screenshots/390x844-quest-details.png) |
| GPX-Detailkarte | [Screenshot](screenshots/320x640-quest-route.png) | [Screenshot](screenshots/360x800-quest-route.png) | [Screenshot](screenshots/390x844-quest-route.png) |
| Globale Karte | [Screenshot](screenshots/320x640-globale-karte.png) | [Screenshot](screenshots/360x800-globale-karte.png) | [Screenshot](screenshots/390x844-globale-karte.png) |
| Navigation Richtung | [Screenshot](screenshots/320x640-navigation-richtung.png) | [Screenshot](screenshots/360x800-navigation-richtung.png) | [Screenshot](screenshots/390x844-navigation-richtung.png) |
| Richtung / Distanz | [Screenshot](screenshots/320x640-navigation-richtung-distanz.png) | [Screenshot](screenshots/360x800-navigation-richtung-distanz.png) | [Screenshot](screenshots/390x844-navigation-richtung-distanz.png) |
| Navigation Karte | [Screenshot](screenshots/320x640-navigation-karte.png) | [Screenshot](screenshots/360x800-navigation-karte.png) | [Screenshot](screenshots/390x844-navigation-karte.png) |
| Rucksack | [Screenshot](screenshots/320x640-rucksack.png) | [Screenshot](screenshots/360x800-rucksack.png) | [Screenshot](screenshots/390x844-rucksack.png) |
| Profil | [Screenshot](screenshots/320x640-profil.png) | [Screenshot](screenshots/360x800-profil.png) | [Screenshot](screenshots/390x844-profil.png) |
| Kachelfehler | [Screenshot](screenshots/320x640-kartenfehler.png) | [Screenshot](screenshots/360x800-kartenfehler.png) | [Screenshot](screenshots/390x844-kartenfehler.png) |

## Stop-Gate

**Designfreigabe für Phase 1–2 und Zustimmung zur dauerhaften Browser-CA-Konfiguration vom Nutzer erhalten.** Die anschließende Kartenprüfung und Screenshotaktualisierung sind abgeschlossen. Weitere Entwicklungsphasen wurden nicht begonnen. Native Geräte-, Kartenlizenz- und Feldabnahmen bleiben erforderlich; die Designfreigabe veröffentlicht keine Outdoor-Quest.

# Wyldo: eigenständige Expo-Basis und Design-/Kartenprototyp V1.2

Das bisher leere App-Repository erhält einen eigenständigen React-Native-/Expo-Neubau nach Masterpaket V1.2. Vier Tabs, Suche, Questdetails mit dem vollständigen 218-Punkte-GPX-Track, globale Karte mit je einem Startpin für zwei ausdrücklich fiktive Testquests sowie separate Karten-/Richtungssimulation sind implementiert. Original-Wyldo und Theme sind integriert; ungeprüfte Stationen werden nicht ausgeliefert. Externsteine bleibt unveröffentlicht und nur im Dev-Build sichtbar. Backend, Quest-Engine, Live-GPS und Belohnungen bleiben hinter dem Designfreigabe-Gate.

Das Masterpaket wurde inhaltlich unverändert in die vorgesehenen Rootpfade verschoben. Die Architektur trennt Routing, Features, UI, Domäne und lokale Repositoryadapter.

Validierung: `npm ci`, TypeScript und Formatprüfung erfolgreich; 12 Domänentests, 45 Browserprüfungen und 3 Produktions-Sperrprüfungen bestanden. Webexport sowie iOS-/Android-JS-/Hermes-Exports erfolgreich. 30 echte Screenshots bei 320×640, 360×800 und 390×844, Architektur, Befehle und Abweichungsliste stehen unter [`docs/implementation/REVIEW.md`](https://github.com/carljust/app-wyldo/blob/feat/wyldo-design-v12/docs/implementation/REVIEW.md).

Kartenprüfung nach expliziter Nutzerzustimmung zur Browser-Proxy-CA-Konfiguration erfolgreich: echte OSM-Rasterkacheln, vollständiger GPX-Track und Startpins werden mit eingeschalteter TLS-Prüfung geladen. Die 30 Screenshots sind aktualisiert; Tile-Fehler werden separat gezielt simuliert.

Offen: Native Geräte-/Simulatorprüfung und Android-Maps-Key-Konfiguration. Das Design nutzt eigene Vektorlandschaften statt noch fehlender separater Natur-Cover. Keine Outdoor- oder Produktionsfreigabe behauptet.

**Designfreigabe für Phase 1–2 vom Nutzer erhalten. Keine Folgephase implementiert; native Geräte- und Outdoor-Abnahmen bleiben offen.**

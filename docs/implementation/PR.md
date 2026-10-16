# Wyldo: eigenständige Expo-Basis und Design-/Kartenprototyp V1.2

Das bisher leere App-Repository erhält einen eigenständigen React-Native-/Expo-Neubau nach Masterpaket V1.2. Vier Tabs, Suche, Questdetails mit dem vollständigen 218-Punkte-GPX-Track, globale Karte mit je einem Startpin für zwei ausdrücklich fiktive Testquests sowie separate Karten-/Richtungssimulation sind implementiert. Original-Wyldo und Theme sind integriert; ungeprüfte Stationen werden nicht ausgeliefert. Externsteine bleibt unveröffentlicht und nur im Dev-Build sichtbar. Backend, Quest-Engine, Live-GPS und Belohnungen bleiben hinter dem Designfreigabe-Gate.

Das Masterpaket wurde inhaltlich unverändert in die vorgesehenen Rootpfade verschoben. Die Architektur trennt Routing, Features, UI, Domäne und lokale Repositoryadapter.

Validierung: `npm ci`, TypeScript und Formatprüfung erfolgreich; 12 Domänentests, 42 Browserprüfungen und 3 Produktions-Sperrprüfungen bestanden. Webexport sowie iOS-/Android-JS-/Hermes-Exports erfolgreich. 30 echte Screenshots bei 320×640, 360×800 und 390×844, Architektur, Befehle und Abweichungsliste stehen unter [`docs/implementation/REVIEW.md`](https://github.com/carljust/app-wyldo/blob/feat/wyldo-design-v12/docs/implementation/REVIEW.md).

Offen: Die Domainfreigabe ist wirksam, aber Chromium vertraut der bereitgestellten Cloud-Proxy-CA noch nicht (`ERR_CERT_AUTHORITY_INVALID`). Der permanente CA-Import wurde durch die automatische Freigabeprüfung abgelehnt und nicht ausgeführt. Screenshots zeigen den ehrlichen Kachelfehler samt Track/Pins; eine geladene Basiskarte bleibt unbestätigt. Native Geräte-/Simulatorprüfung und Android-Maps-Key-Konfiguration fehlen. Das Design nutzt eigene Vektorlandschaften statt noch fehlender separater Natur-Cover. Keine Outdoor- oder Produktionsfreigabe behauptet.

**Designreview erforderlich. STOP nach Phase 2; keine Folgephase ohne ausdrückliche visuelle Freigabe.**

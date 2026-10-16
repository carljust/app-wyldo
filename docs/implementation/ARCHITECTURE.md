# Architekturentscheidungen · Phase 1–2

## Aufbau

- `app/`: dünne Expo-Router-Routen, Root-Stack, vier Tabs; Details und Navigation als separate Stackansichten.
- `src/features/`: Entdecken, Karte, Questdetails, Startnavigation, Rucksack- und Profilvorschau.
- `src/components/`: wiederverwendbare UI, Originalfuchs, dekorative Landschaft und plattformspezifische echte Karten.
- `src/theme/`: zentrale Farben, Schriftfamilien, Abstände und Radien.
- `src/domain/`: Quest-/Repository-Verträge, reine Kartenprojektionen, Haversine, Peilung und Bildschirmclustering; keine UI- oder Backendabhängigkeit.
- `src/data/`: lokale Fixture-Repository-Implementierung und ausschließlich die GPX-LineString. Keine CSV-Stationen oder Rätselantworten im App-Bundle importiert.
- `tests/`: Verhalten von Karten A/B/C und Datenfreigaben; `scripts/visual-check.mjs`: Browserinteraktionen und responsive Screenshots.

## Stackentscheidung

Installiert nach der mit Expo 58.0.14 gelieferten SDK-Kompatibilitätsmatrix: React 19.3, React Native 0.88, Expo Router 58, react-native-maps 1.29.11, react-native-svg. Die aktuellen npm-Paketmetadaten waren erreichbar; die zusätzliche Online-Abfrage der React Native Directory war nicht erreichbar. Keine frei geratenen Kombinationen oder erzwungenen Peer-Dependency-Installationen. TypeScript strikt, festgeschriebene Abhängigkeiten über npm lockfile.

Native Karte: react-native-maps, da Expo die Native-Version vorgibt. iOS MapKit; Android Google-SDK-Unterbau, dessen API-Key/Development-Build-Konfiguration noch aussteht. Die SDK-Karte ist kein WebView. Leaflet ist ausschließlich der ergänzende Browseradapter. Alle Adapter erhalten dieselben geprüften `MapModel`-Daten. Native Laufzeit, Kachelfailure-UI und Zoomcluster auf Geräten bleiben noch zu prüfen; erfolgreiche JS-Exports beweisen keine nativen Laufzeitfunktionen.

## Daten und Karten

`listPublishedQuests` liefert nur Summary-Projektionen ohne Routen/Stationen. Beide veröffentlicht modellierten Fixtures sind überall als fiktiver lokaler Testkatalog markiert, kein Produktionsangebot. `getDraftQuestPreview` und sichtbare Draftrouten werden durch `__DEV__` gesperrt. Das ist eine UI-Grenze, keine Sicherheitsmaßnahme für geheime Daten. Die lokale GPX ist nicht vertraulich; Stationskandidaten bleiben außerhalb des ausgelieferten App-Contents.

`detailMap` übernimmt alle 218 Punkte in Originalreihenfolge, wandelt `[lon, lat]` in Kartenkoordinaten um und vereinigt Endpunkte bis 25 m. Web-Simplifizierung deaktiviert. Fehlende Route führt zu einem leeren Zustand, nicht zu einer Ersatzgeometrie. Native und Web passen Grenzen mit Padding an. Öffentliche Pins werden nach Bildschirmabstand geclustert; Cluster öffnen einen engeren Kartenausschnitt.

Die Richtungssimulation berechnet echte Haversine-Entfernung und Zielpeilung aus **simulierten Eingaben**. Ein Bedienelement dreht das simulierte Heading. Keine feste Zahl wird als Live-Messung ausgegeben. Zielmarker erzeugen weder Ankunft noch Questfortschritt. Im Kartenmodus der Startnavigation wird kein ungeprüfter Track als Anreiseweg angeboten.

## Nach Designfreigabe, ausdrücklich nicht implementiert

1. Supabase-Repository statt Fixtures; PostgreSQL-Modelle, Versionierung und explizite öffentliche/private Payloads.
2. RLS für persönliche Daten; keine Service-Role-Credentials im Client. Serververifizierte Antworten; keine geheimen Lösungen im Download.
3. SQLite-Cache mit Quest-/Medienversionen und später privaten Sessiondaten. Idempotente Outbox mit eindeutigen Operation-/Session-/Event-IDs; serverseitige XP-Ledger-Constraints gegen Doppelvergabe.
4. `expo-location` nur nach Einwilligung und Feldfreigaben: Genauigkeit, Headingqualität, Radius/Hysterese, Abbruch/Fortsetzen; keine Hintergrundortung.
5. Lizenzierte Offline-Karten separat vom Offline-Quest-Cache. Kein Bulkdownload aus öffentlichen OSM-Tiles.

## Bewusste Grenzen

Kein Fake-Login, keine erfundenen Level/XP-Fortschritte, kein echtes Inventar. Profil und Rucksack sind beschriftete Vorschauen. Kein Git-Worktree nötig: isolierte Cloud-Aufgabe verwendet vorhandenen Checkout. Master-V1.2-Sicherheitsregeln überstimmen illustrierte Mockupangaben.

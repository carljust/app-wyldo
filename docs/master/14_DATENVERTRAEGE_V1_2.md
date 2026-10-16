# Datenverträge für Maps, Route und Quest-Spoiler (V1.2)

## Vorschlag – öffentlich geladene Questzusammenfassung
```ts
type GeoPoint = { latitude: number; longitude: number };
type QuestListItem = {
  id: string;
  slug: string;
  title: string;
  coverAssetId: string | null;
  startPoint: GeoPoint; // für globalen Pin; nur veröffentlicht
  estimatedDistanceM: number | null; // ausschließlich freigegeben
  estimatedDurationMin: number | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  recommendedAge: number | null;
  status: 'published';
};
```
Das List-Endpoint darf keine Stationen, Antworten oder ganze Routengeometrien mitladen. Filter/Suche/Cluster auf Startpunkten.

## Vorschlag – Details
```ts
type QuestRoute = {
  questId: string;
  geometry: { type: 'LineString'; coordinates: [number, number][] }; // GeoJSON: [lon, lat]
  source: 'gpx_import' | 'verified_author_route';
  approval: 'draft' | 'field_verified';
  routeVersion: string;
};
type QuestDetail = {
  id: string;
  title: string;
  startPoint: GeoPoint | null; // draft: candidate möglich, Label erforderlich
  finishPoint: GeoPoint | null;
  isLoop: boolean;
  route: QuestRoute | null; // nur für Detailkarten-/expliziten Preview-Kontext
  spoilerPolicy: 'hide_stations';
  outdoorPlayable: boolean;
};
```
**Wichtig:** nur `published` Quests im echten Discovery-Feed. Externsteine aktuell `draft`, in Dev-Preview jedoch sichtbar mit Warnhinweis. Ein echter Provider-Backendvertrag ist erst nach dessen Implementation verbindlich; diese Typen definieren das gewünschte Verhalten.

## Kandidatenstationen (nur Entwicklungsumgebung)
- Eventuell als eigene Datei unter `docs/master/geo` bzw. abgesicherter Draft-DB verwalten.
- `approvedGpsTrigger: null`, `fieldValidationStatus: not_verified`, `answerValidationRef: null`.
- **Nie** aus der 8-Punkte-CSV öffentlich sichtbare Kapitelpins oder ein falsches Routennetz erzeugen.
- Frontend erhält nur aktuell freigegebene Stationsdaten für Live-Quests; spätere Storyinfos gemäß Spoilerpolicy.

## Trennung der Karten-Abfragen
`listPublishedQuests()` → Startpunkte (+ Ansichtsinformationen); `getQuestDetails(id)` → Metadaten + spezifische Routengeometrie (+ Freigabe-Flag); `getActiveTarget(sessionId)` → nur aktuelles Ziel und Kartenrelevantes; `getDraftQuestPreview` → nur in Dev.

## Synchronisation / Security
Versionierte Quellen und Geometrie; gesicherte private Benutzerfortschritte, RLS, idempotente Rewardbuchungen, keine geheimen Lösungen auf dem Gerät. Zusätzliche Netzwerk-Caches nicht als Offline-Kartenkacheln bezeichnen.

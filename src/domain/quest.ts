export type Point = { latitude: number; longitude: number };
export type QuestSummary = {
  id: string;
  title: string;
  subtitle: string;
  startPoint: Point;
  status: "published" | "draft";
  kind: "fixture" | "editorial";
  recommendedAge: number | null;
  difficulty: string | null;
};
export type QuestRoute = {
  geometry: { type: "LineString"; coordinates: [number, number][] };
  source: "gpx_import" | "verified_author_route";
  approval: "draft" | "field_verified";
  routeVersion: string;
};
export type QuestDetail = QuestSummary & {
  description: string;
  route: QuestRoute | null;
  outdoorPlayable: false;
  spoilerPolicy: "hide_stations";
  chapters: number;
  seals: number;
};
export interface QuestRepository {
  listPublishedQuests(): QuestSummary[];
  getQuestDetails(id: string): QuestDetail | undefined;
  getDraftQuestPreview(): QuestDetail | undefined;
}

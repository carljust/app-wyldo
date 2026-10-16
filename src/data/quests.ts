import geometry from "./oh6-route.json";
import type {
  QuestDetail,
  QuestRepository,
  QuestSummary,
  QuestRoute,
} from "../domain/quest";
const route: QuestRoute = {
  geometry: geometry as QuestRoute["geometry"],
  source: "gpx_import",
  approval: "draft",
  routeVersion: "oh6-user-gpx-v1",
};
const quests: QuestDetail[] = [
  {
    id: "externsteine",
    title: "Der verlorene Schatz der Externsteine",
    subtitle: "Acht Kapitel. Vier Steinsiegel. Ein großes Geheimnis.",
    status: "draft",
    kind: "editorial",
    startPoint: { latitude: 51.86905, longitude: 8.91786 },
    recommendedAge: 7,
    difficulty: null,
    route,
    outdoorPlayable: false,
    spoilerPolicy: "hide_stations",
    chapters: 8,
    seals: 4,
    description:
      "Eine uralte Schatzkarte führt Wyldo zu den geheimnisvollen Externsteinen. Gemeinsam mit Runa, dem Steinkauz, folgt ihr den Zeichen der Natur und entdeckt die Geschichte der vier verlorenen Steinsiegel. Der Kristallschatz ist virtuell – die Entdeckungen macht ihr draußen.",
  },
  {
    id: "waldlicht",
    title: "Das Geheimnis des Waldlichts",
    subtitle: "Eine Testquest für kleine Entdecker.",
    status: "published",
    kind: "fixture",
    startPoint: { latitude: 51.891, longitude: 8.897 },
    recommendedAge: null,
    difficulty: null,
    route: null,
    outdoorPlayable: false,
    spoilerPolicy: "hide_stations",
    chapters: 0,
    seals: 0,
    description:
      "Fiktive Testquest zur Prüfung von Kartenpins und Navigation. Keine reale Mission und kein geprüftes Outdoor-Angebot.",
  },
  {
    id: "silberbach",
    title: "Die Botschaft vom Silberbach",
    subtitle: "Eine zweite Testquest für die Kartenprüfung.",
    status: "published",
    kind: "fixture",
    startPoint: { latitude: 51.885, longitude: 8.941 },
    recommendedAge: null,
    difficulty: null,
    route: null,
    outdoorPlayable: false,
    spoilerPolicy: "hide_stations",
    chapters: 0,
    seals: 0,
    description:
      "Fiktive Testquest mit eigenem Startpin. Dient ausschließlich der Interaktionsprüfung; Route, Alter und Spielinhalte sind nicht freigegeben.",
  },
];
// Explicit projections keep routes, candidate stations and editorial data out of discovery.
function summary(q: QuestDetail): QuestSummary {
  const {
    id,
    title,
    subtitle,
    status,
    kind,
    startPoint,
    recommendedAge,
    difficulty,
  } = q;
  return {
    id,
    title,
    subtitle,
    status,
    kind,
    startPoint,
    recommendedAge,
    difficulty,
  };
}
export const questRepository: QuestRepository = {
  listPublishedQuests: () =>
    quests.filter((q) => q.status === "published").map(summary),
  getQuestDetails: (id) => quests.find((q) => q.id === id),
  getDraftQuestPreview: () =>
    __DEV__ ? quests.find((q) => q.id === "externsteine") : undefined,
};
export function getVisibleQuest(id: string) {
  const q = questRepository.getQuestDetails(id);
  return q?.status === "draft" && !__DEV__ ? undefined : q;
}

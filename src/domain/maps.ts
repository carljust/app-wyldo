import type { Point, QuestDetail, QuestSummary } from "./quest";
const rad = (n: number) => (n * Math.PI) / 180;
export function airDistance(a: Point, b: Point) {
  const h =
    Math.sin(rad(b.latitude - a.latitude) / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
      Math.cos(rad(b.latitude)) *
      Math.sin(rad(b.longitude - a.longitude) / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
export function bearing(a: Point, b: Point) {
  const d = rad(b.longitude - a.longitude);
  return (
    ((Math.atan2(
      Math.sin(d) * Math.cos(rad(b.latitude)),
      Math.cos(rad(a.latitude)) * Math.sin(rad(b.latitude)) -
        Math.sin(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.cos(d),
    ) *
      180) /
      Math.PI +
      360) %
    360
  );
}
export type MapPin = {
  id: string;
  point: Point;
  label: string;
  questIds?: string[];
};
export type MapModel = { pins: MapPin[]; line: Point[] };
export function globalMap(quests: QuestSummary[]): MapModel {
  return {
    pins: quests
      .filter((q) => q.status === "published")
      .map((q) => ({
        id: q.id,
        point: q.startPoint,
        label: q.title,
        questIds: [q.id],
      })),
    line: [],
  };
}
export function detailMap(quest: QuestDetail): MapModel {
  const line =
    quest.route?.geometry.coordinates.map(([longitude, latitude]) => ({
      latitude,
      longitude,
    })) ?? [];
  if (!line.length) return { pins: [], line: [] };
  const start = line[0],
    end = line[line.length - 1];
  return {
    line,
    pins:
      airDistance(start, end) <= 25
        ? [
            {
              id: "start-finish",
              point: start,
              label: "Start / Ziel · Kandidat",
            },
          ]
        : [
            { id: "start", point: start, label: "Start" },
            { id: "finish", point: end, label: "Ziel" },
          ],
  };
}
// Screen-space clustering is recalculated whenever the map zoom changes.
export function clusterPins(
  pins: MapPin[],
  project: (p: Point) => { x: number; y: number },
  radius = 44,
): MapPin[] {
  const clusters: MapPin[] = [];
  for (const pin of pins) {
    const p = project(pin.point);
    const match = clusters.find((c) => {
      const q = project(c.point);
      return Math.hypot(p.x - q.x, p.y - q.y) < radius;
    });
    if (match) {
      match.questIds = [
        ...(match.questIds ?? [match.id]),
        ...(pin.questIds ?? [pin.id]),
      ];
      match.label = `${match.questIds.length} Testquests`;
    } else
      clusters.push({
        ...pin,
        questIds: pin.questIds ? [...pin.questIds] : undefined,
      });
  }
  return clusters;
}
export function navigationModel(origin: Point, target: Point, heading: number) {
  return {
    distanceM: airDistance(origin, target),
    label: "Luftlinie",
    rotation: (bearing(origin, target) - heading + 360) % 360,
    warning: "Auf markierten Wegen bleiben",
  };
}

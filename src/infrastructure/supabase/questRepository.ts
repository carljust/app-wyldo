import type { SupabaseClient } from "@supabase/supabase-js";
import type { QuestSummary, QuestDetail, QuestRoute } from "../../domain/quest";
export function publishedSummary(row: Record<string, unknown>): QuestSummary {
  const {
    id,
    title,
    subtitle,
    start_latitude: lat,
    start_longitude: lon,
    recommended_age: age,
    difficulty,
  } = row;
  if (
    typeof id !== "string" ||
    typeof title !== "string" ||
    typeof subtitle !== "string" ||
    typeof lat !== "number" ||
    !Number.isFinite(lat) ||
    Math.abs(lat) > 90 ||
    typeof lon !== "number" ||
    !Number.isFinite(lon) ||
    Math.abs(lon) > 180
  )
    throw new Error("Invalid quest summary");
  if (
    age !== null &&
    (typeof age !== "number" || !Number.isInteger(age) || age < 0)
  )
    throw new Error("Invalid age");
  if (
    difficulty !== null &&
    !["easy", "medium", "hard"].includes(String(difficulty))
  )
    throw new Error("Invalid difficulty");
  return {
    id,
    title,
    subtitle,
    startPoint: { latitude: lat, longitude: lon },
    recommendedAge: age as number | null,
    difficulty: difficulty as string | null,
    status: "published",
    kind: "editorial",
  };
}
export function publishedRoute(row: Record<string, unknown>): QuestRoute {
  const geometry = row.geometry as { type?: unknown; coordinates?: unknown };
  if (
    row.approval !== "field_verified" ||
    !["gpx_import", "verified_author_route"].includes(String(row.source)) ||
    typeof row.route_version !== "string" ||
    !geometry ||
    geometry.type !== "LineString" ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length < 2
  )
    throw new Error("Invalid route");
  for (const point of geometry.coordinates) {
    if (
      !Array.isArray(point) ||
      point.length !== 2 ||
      typeof point[0] !== "number" ||
      typeof point[1] !== "number" ||
      !Number.isFinite(point[0]) ||
      !Number.isFinite(point[1]) ||
      Math.abs(point[0]) > 180 ||
      Math.abs(point[1]) > 90
    )
      throw new Error("Invalid coordinate");
  }
  return {
    geometry: {
      type: "LineString",
      coordinates: geometry.coordinates as [number, number][],
    },
    source: row.source as QuestRoute["source"],
    approval: "field_verified",
    routeVersion: row.route_version,
  };
}
const columns =
  "id,title,subtitle,start_latitude,start_longitude,recommended_age,difficulty";
export class SupabaseQuestRepository {
  constructor(private client: SupabaseClient) {}
  async listPublishedQuests(): Promise<QuestSummary[]> {
    const { data, error } = await this.client
      .from("quest_summaries")
      .select(columns);
    if (error) throw error;
    return (data ?? []).map(publishedSummary);
  }
  async getQuestDetails(id: string): Promise<QuestDetail | undefined> {
    const { data, error } = await this.client
      .from("quests")
      .select(`${columns},description,chapters,seals,outdoor_playable`)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return undefined;
    const { data: version, error: versionError } = await this.client
      .from("quest_versions")
      .select("id")
      .eq("quest_id", id)
      .eq("status", "published")
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (versionError) throw versionError;
    let route: QuestRoute | null = null;
    if (version) {
      const { data: r, error: e } = await this.client
        .from("quest_routes")
        .select("geometry,source,approval,route_version")
        .eq("quest_version_id", version.id)
        .maybeSingle();
      if (e) throw e;
      if (r) route = publishedRoute(r);
    }
    if (
      typeof data.description !== "string" ||
      !Number.isInteger(data.chapters) ||
      !Number.isInteger(data.seals)
    )
      throw new Error("Invalid quest details");
    return {
      ...publishedSummary(data),
      description: data.description,
      chapters: data.chapters,
      seals: data.seals,
      route,
      outdoorPlayable: data.outdoor_playable === true,
      questVersionId: version?.id,
      spoilerPolicy: "hide_stations",
    };
  }
}

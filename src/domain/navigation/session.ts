import { z } from "zod";
import { airDistance } from "../maps";
import type { QuestDetail } from "../quest";
const point = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});
const route = z.object({
  geometry: z.object({
    type: z.literal("LineString"),
    coordinates: z
      .array(
        z.tuple([
          z.number().finite().min(-180).max(180),
          z.number().finite().min(-90).max(90),
        ]),
      )
      .min(2),
  }),
  source: z.enum(["gpx_import", "verified_author_route"]),
  approval: z.enum(["draft", "field_verified"]),
  routeVersion: z.string().min(1),
});
export const questSnapshotSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  subtitle: z.string(),
  startPoint: point,
  status: z.enum(["published", "draft"]),
  kind: z.enum(["fixture", "editorial"]),
  recommendedAge: z.number().nullable(),
  difficulty: z.string().nullable(),
  description: z.string(),
  route: route.nullable(),
  outdoorPlayable: z.boolean(),
  spoilerPolicy: z.literal("hide_stations"),
  chapters: z.number().int().nonnegative(),
  seals: z.number().int().nonnegative(),
  questVersionId: z.string().uuid().optional(),
});
export const targetSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["start", "station"]),
  point,
  radiusM: z.number().min(10).max(100),
  fieldApproval: z.enum(["draft", "approved"]),
  questVersion: z.string(),
});
export const fixSchema = z.object({
  point,
  accuracyM: z.number().finite().nonnegative(),
  timestamp: z.number().finite(),
});
export const phaseSchema = z.enum([
  "not_started",
  "navigating_to_start",
  "ready_at_start",
  "intro",
  "awaiting_target",
  "navigating_to_station",
  "station_event",
]);
export const sessionSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().uuid(),
  scope: z.string().min(1),
  mode: z.enum(["simulation", "live"]),
  quest: questSnapshotSchema,
  questVersion: z.string(),
  phase: phaseSchema,
  paused: z.boolean(),
  target: targetSchema.nullable(),
  fix: fixSchema.nullable(),
  gpsStatus: z.enum(["unavailable", "inaccurate", "stale", "available"]),
  heading: z.number().finite().min(0).lt(360).nullable(),
  stableSamples: z.number().int().nonnegative(),
  stableSince: z.number().nullable(),
  revision: z.number().int().nonnegative(),
  updatedAt: z.number().finite(),
});
export type NavigationSession = z.infer<typeof sessionSchema>;
export type Target = z.infer<typeof targetSchema>;
export type PositionFix = z.infer<typeof fixSchema>;
export type Phase = z.infer<typeof phaseSchema>;
export type Command =
  | {
      type:
        | "BEGIN"
        | "PAUSE"
        | "RESUME"
        | "POSITION_UNAVAILABLE"
        | "START_QUEST"
        | "FINISH_INTRO";
      now: number;
    }
  | { type: "FIX"; fix: PositionFix; now: number }
  | { type: "HEADING"; heading: number | null; now: number }
  | { type: "SET_TARGET"; target: Target; now: number };
export function canUseLiveNavigation(
  q: QuestDetail,
  ownerId: string | null,
): boolean {
  return (
    !!ownerId &&
    z.string().uuid().safeParse(ownerId).success &&
    q.status === "published" &&
    q.outdoorPlayable &&
    q.route?.approval === "field_verified" &&
    !!q.questVersionId
  );
}
export function createSession(
  q: QuestDetail,
  mode: "simulation" | "live",
  ownerId: string | null,
  id: string,
  now: number,
): NavigationSession {
  if (mode === "live" && !canUseLiveNavigation(q, ownerId))
    throw new Error("live_navigation_not_approved");
  const questVersion =
    q.questVersionId ?? q.route?.routeVersion ?? "local-fixture-v1";
  return sessionSchema.parse({
    schemaVersion: 1,
    id,
    scope: mode === "simulation" ? "dev-simulation" : ownerId!,
    mode,
    quest: q,
    questVersion,
    phase: "not_started",
    paused: false,
    target: {
      id: "start",
      kind: "start",
      point: q.startPoint,
      radiusM: 30,
      fieldApproval: mode === "live" ? "approved" : "draft",
      questVersion,
    },
    fix:
      mode === "simulation"
        ? {
            point: {
              latitude: Math.max(
                -89.999,
                Math.min(89.999, q.startPoint.latitude + 0.003),
              ),
              longitude: Math.max(
                -179.999,
                Math.min(179.999, q.startPoint.longitude - 0.002),
              ),
            },
            accuracyM: 5,
            timestamp: now,
          }
        : null,
    gpsStatus: mode === "simulation" ? "available" : "unavailable",
    heading: mode === "simulation" ? 0 : null,
    stableSamples: 0,
    stableSince: null,
    revision: 0,
    updatedAt: now,
  });
}
export function isFreshFix(fix: PositionFix | null, now: number) {
  return (
    !!fix &&
    now - fix.timestamp >= 0 &&
    now - fix.timestamp <= 15000 &&
    fix.accuracyM <= 25
  );
}
export function reduceSession(
  current: NavigationSession,
  command: Command,
): NavigationSession {
  if (!Number.isFinite(command.now)) throw new Error("invalid_clock");
  if (current.paused && !["RESUME", "PAUSE"].includes(command.type))
    throw new Error("session_paused");
  let next = { ...current };
  const requirePhase = (...phases: Phase[]) => {
    if (!phases.includes(current.phase)) throw new Error("invalid_transition");
  };
  switch (command.type) {
    case "BEGIN":
      requirePhase("not_started");
      next.phase = "navigating_to_start";
      break;
    case "PAUSE":
      next.paused = true;
      break;
    case "RESUME":
      next.paused = false;
      next.stableSamples = 0;
      next.stableSince = null;
      if (current.mode === "live") {
        next.fix = null;
        next.gpsStatus = "unavailable";
      }
      if (next.phase === "ready_at_start") next.phase = "navigating_to_start";
      break;
    case "POSITION_UNAVAILABLE":
      next.fix = null;
      next.gpsStatus = "unavailable";
      next.stableSamples = 0;
      next.stableSince = null;
      if (next.phase === "ready_at_start") next.phase = "navigating_to_start";
      break;
    case "HEADING":
      if (
        command.heading !== null &&
        (!Number.isFinite(command.heading) ||
          command.heading < 0 ||
          command.heading >= 360)
      )
        throw new Error("invalid_heading");
      next.heading = command.heading;
      break;
    case "FIX": {
      const fix = fixSchema.parse(command.fix);
      if (current.fix && fix.timestamp <= current.fix.timestamp) break;
      if (!isFreshFix(fix, command.now)) {
        next.gpsStatus = fix.accuracyM > 25 ? "inaccurate" : "stale";
        next.stableSamples = 0;
        next.stableSince = null;
        if (next.phase === "ready_at_start") next.phase = "navigating_to_start";
        break;
      }
      next.fix = fix;
      next.gpsStatus = "available";
      const target = current.target;
      if (
        !target ||
        ![
          "navigating_to_start",
          "ready_at_start",
          "navigating_to_station",
        ].includes(current.phase)
      )
        break;
      if (current.mode === "live" && target.fieldApproval !== "approved")
        throw new Error("unverified_target");
      const distance = airDistance(fix.point, target.point);
      const inside = distance + fix.accuracyM <= target.radiusM;
      const outside = distance - fix.accuracyM > target.radiusM + 15;
      if (inside) {
        next.stableSince = current.stableSince ?? fix.timestamp;
        next.stableSamples = current.stableSamples + 1;
        if (next.stableSamples >= 3 && fix.timestamp - next.stableSince >= 6000)
          next.phase =
            target.kind === "start" ? "ready_at_start" : "station_event";
      } else if (outside || current.phase !== "ready_at_start") {
        next.stableSince = null;
        next.stableSamples = 0;
        if (next.phase === "ready_at_start") next.phase = "navigating_to_start";
      }
      break;
    }
    case "START_QUEST": {
      requirePhase("ready_at_start");
      if (
        !current.target ||
        !isFreshFix(current.fix, command.now) ||
        current.gpsStatus !== "available" ||
        current.stableSamples < 3 ||
        airDistance(current.fix!.point, current.target.point) +
          current.fix!.accuracyM >
          current.target.radiusM
      )
        throw new Error("arrival_not_confirmed");
      next.phase = "intro";
      break;
    }
    case "FINISH_INTRO":
      requirePhase("intro");
      next.phase = "awaiting_target";
      next.target = null;
      next.stableSamples = 0;
      next.stableSince = null;
      break;
    case "SET_TARGET": {
      requirePhase("awaiting_target");
      const target = targetSchema.parse(command.target);
      if (
        target.kind !== "station" ||
        target.questVersion !== current.questVersion
      )
        throw new Error("invalid_target");
      if (current.mode === "live" && target.fieldApproval !== "approved")
        throw new Error("unverified_target");
      next.target = target;
      next.phase = "navigating_to_station";
      next.stableSamples = 0;
      next.stableSince = null;
      break;
    }
    default:
      throw new Error("unsupported_command");
  }
  return sessionSchema.parse({
    ...next,
    revision: current.revision + 1,
    updatedAt: command.now,
  });
}
export function decodeSession(
  raw: string,
  scope: string,
  questId: string,
): NavigationSession {
  const state = sessionSchema.parse(JSON.parse(raw));
  if (state.scope !== scope || state.quest.id !== questId)
    throw new Error("session_scope_mismatch");
  if (
    state.mode === "live" &&
    (state.scope === "dev-simulation" ||
      !canUseLiveNavigation(state.quest, state.scope))
  )
    throw new Error("invalid_live_session");
  if (
    state.mode === "live" &&
    state.target &&
    (state.target.fieldApproval !== "approved" ||
      state.target.questVersion !== state.questVersion)
  )
    throw new Error("invalid_live_target");
  return state;
}

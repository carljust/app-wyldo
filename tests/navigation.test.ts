import test from "node:test";
import assert from "node:assert/strict";
import { questRepository } from "../src/data/quests";
import {
  createSession,
  reduceSession,
  canUseLiveNavigation,
  decodeSession,
  type NavigationSession,
} from "../src/domain/navigation/session";
import { startApprovedLocation } from "../src/domain/navigation/location";
Object.assign(globalThis, { __DEV__: true });
const q = questRepository.getDraftQuestPreview()!;
const id = "10000000-0000-4000-8000-000000000001";
const owner = "11111111-1111-4111-8111-111111111111";
function initial() {
  return reduceSession(createSession(q, "simulation", null, id, 100000), {
    type: "BEGIN",
    now: 100000,
  });
}
function arrived() {
  let s = initial();
  for (const timestamp of [100001, 103001, 106001])
    s = reduceSession(s, {
      type: "FIX",
      fix: { point: q.startPoint, accuracyM: 5, timestamp },
      now: 106001,
    });
  return s;
}
test("unverified quests and anonymous users cannot start live navigation", () => {
  assert.equal(canUseLiveNavigation(q, owner), false);
  assert.throws(() => createSession(q, "live", owner, id, 100000));
  const approved = {
    ...q,
    status: "published" as const,
    outdoorPlayable: true,
    questVersionId: id,
    route: { ...q.route!, approval: "field_verified" as const },
  };
  assert.equal(canUseLiveNavigation(approved, owner), true);
  assert.equal(canUseLiveNavigation(approved, null), false);
});
test("arrival needs three accurate observations spanning six seconds and conscious start", () => {
  let s = initial();
  for (const timestamp of [100001, 103001]) {
    s = reduceSession(s, {
      type: "FIX",
      fix: { point: q.startPoint, accuracyM: 5, timestamp },
      now: 106001,
    });
    assert.equal(s.phase, "navigating_to_start");
  }
  s = reduceSession(s, {
    type: "FIX",
    fix: { point: q.startPoint, accuracyM: 5, timestamp: 106001 },
    now: 106001,
  });
  assert.equal(s.phase, "ready_at_start");
  assert.equal(
    reduceSession(s, { type: "START_QUEST", now: 106002 }).phase,
    "intro",
  );
});
test("duplicate timestamps, inaccurate, stale and future fixes do not unlock arrival", () => {
  let s = initial();
  for (let n = 0; n < 5; n++)
    s = reduceSession(s, {
      type: "FIX",
      fix: { point: q.startPoint, accuracyM: 5, timestamp: 100001 },
      now: 106001,
    });
  assert.equal(s.stableSamples, 1);
  for (const fix of [
    { point: q.startPoint, accuracyM: 50, timestamp: 106002 },
    { point: q.startPoint, accuracyM: 5, timestamp: 106003 },
    { point: q.startPoint, accuracyM: 5, timestamp: 200000 },
  ]) {
    s = reduceSession(s, { type: "FIX", fix, now: 150000 });
    assert.notEqual(s.phase, "ready_at_start");
  }
  assert.throws(() =>
    reduceSession(arrived(), { type: "START_QUEST", now: 130000 }),
  );
});
test("hysteresis avoids edge oscillation; leaving radius removes readiness", () => {
  let s = arrived();
  s = reduceSession(s, {
    type: "FIX",
    fix: {
      point: {
        latitude: q.startPoint.latitude + 0.0003,
        longitude: q.startPoint.longitude,
      },
      accuracyM: 5,
      timestamp: 107000,
    },
    now: 107000,
  });
  assert.equal(s.phase, "ready_at_start");
  assert.throws(() => reduceSession(s, { type: "START_QUEST", now: 107001 }));
  s = reduceSession(s, {
    type: "FIX",
    fix: {
      point: {
        latitude: q.startPoint.latitude + 0.001,
        longitude: q.startPoint.longitude,
      },
      accuracyM: 5,
      timestamp: 108000,
    },
    now: 108000,
  });
  assert.equal(s.phase, "navigating_to_start");
});
test("pause blocks GPS and progress; resume preserves intro and requires new arrival when needed", () => {
  const paused = reduceSession(arrived(), { type: "PAUSE", now: 107000 });
  assert.throws(() =>
    reduceSession(paused, { type: "START_QUEST", now: 107001 }),
  );
  assert.throws(() =>
    reduceSession(paused, {
      type: "FIX",
      fix: { point: q.startPoint, accuracyM: 5, timestamp: 108000 },
      now: 108000,
    }),
  );
  assert.equal(
    reduceSession(paused, { type: "RESUME", now: 109000 }).phase,
    "navigating_to_start",
  );
  const intro = reduceSession(arrived(), { type: "START_QUEST", now: 106002 });
  const p = reduceSession(intro, { type: "PAUSE", now: 107000 });
  assert.equal(
    reduceSession(p, { type: "RESUME", now: 109000 }).phase,
    "intro",
  );
});
test("intro stops without an approved next target; no hidden chapter coordinates invented", () => {
  let s = reduceSession(arrived(), { type: "START_QUEST", now: 106002 });
  s = reduceSession(s, { type: "FINISH_INTRO", now: 106003 });
  assert.equal(s.phase, "awaiting_target");
  assert.equal(s.target, null);
  assert.throws(() =>
    reduceSession(initial(), { type: "FINISH_INTRO", now: 106003 }),
  );
  assert.throws(() =>
    reduceSession(s, {
      type: "SET_TARGET",
      target: {
        id: "bad-version",
        kind: "station",
        point: q.startPoint,
        radiusM: 30,
        fieldApproval: "draft",
        questVersion: "wrong",
      },
      now: 106004,
    }),
  );
});
test("corrupt, foreign-scope and unsupported-version persisted sessions fail closed", () => {
  const s = initial();
  assert.throws(() => decodeSession(JSON.stringify(s), "someone-else", q.id));
  assert.throws(() =>
    decodeSession(JSON.stringify({ ...s, schemaVersion: 99 }), s.scope, q.id),
  );
  assert.throws(() =>
    decodeSession(JSON.stringify({ ...s, phase: "completed" }), s.scope, q.id),
  );
});
test("location permission is never requested for a draft; denied permission creates no watcher", async () => {
  let permissionCalls = 0,
    watchCalls = 0;
  const provider = {
    async requestPermission() {
      permissionCalls++;
      return false;
    },
    async watchPosition() {
      watchCalls++;
      return () => {};
    },
    async watchHeading() {
      watchCalls++;
      return () => {};
    },
  };
  await assert.rejects(() =>
    startApprovedLocation(
      provider,
      q,
      owner,
      () => {},
      () => {},
    ),
  );
  assert.equal(permissionCalls, 0);
  const approved = {
    ...q,
    status: "published" as const,
    outdoorPlayable: true,
    questVersionId: id,
    route: { ...q.route!, approval: "field_verified" as const },
  };
  await assert.rejects(() =>
    startApprovedLocation(
      provider,
      approved,
      owner,
      () => {},
      () => {},
    ),
  );
  assert.equal(permissionCalls, 1);
  assert.equal(watchCalls, 0);
});
test("foreground watchers clean up and missing heading falls back without fabricating bearing", async () => {
  const approved = {
    ...q,
    status: "published" as const,
    outdoorPlayable: true,
    questVersionId: id,
    route: { ...q.route!, approval: "field_verified" as const },
  };
  let stopped = 0,
    heading: number | null = 45;
  const stop = await startApprovedLocation(
    {
      async requestPermission() {
        return true;
      },
      async watchPosition() {
        return () => {
          stopped++;
        };
      },
      async watchHeading() {
        throw new Error("No magnetometer");
      },
    },
    approved,
    owner,
    () => {},
    (value) => {
      heading = value;
    },
  );
  assert.equal(heading, null);
  stop();
  assert.equal(stopped, 1);
});

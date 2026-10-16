import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { questRepository } from "../src/data/quests";
import {
  airDistance,
  clusterPins,
  detailMap,
  globalMap,
  navigationModel,
} from "../src/domain/maps";
Object.assign(globalThis, { __DEV__: true });
const published = questRepository.listPublishedQuests();
const draft = questRepository.getDraftQuestPreview()!;
test("one published quest yields exactly one start pin", () => {
  const m = globalMap([published[0]]);
  assert.equal(m.pins.length, 1);
  assert.deepEqual(m.pins[0].point, published[0].startPoint);
});
test("draft quest yields zero public pins", () =>
  assert.equal(globalMap([draft]).pins.length, 0));
test("two quests retain independent preview identities and detail selection", () => {
  const pins = globalMap(published).pins;
  assert.equal(pins.length, 2);
  for (const pin of pins)
    assert.equal(questRepository.getQuestDetails(pin.id)?.title, pin.label);
  assert.notEqual(pins[0].id, pins[1].id);
});
test("global map contains no polyline or stage markers", () => {
  const m = globalMap([...published, draft]);
  assert.deepEqual(m.line, []);
  assert.deepEqual(
    m.pins.map((x) => x.id),
    published.map((x) => x.id),
  );
});
test("detail route includes all 218 original GPX points in correct lon/lat order", () => {
  const gpx = readFileSync(
    "docs/master/geo/kindererlebniswelt-natur-knickenhagen-an-den-externsteinen-oh-6.gpx",
    "utf8",
  );
  const expected = [...gpx.matchAll(/<trkpt lat="([^"]+)" lon="([^"]+)"/g)].map(
    (m) => ({ latitude: +m[1], longitude: +m[2] }),
  );
  const m = detailMap(draft);
  assert.equal(expected.length, 218);
  assert.deepEqual(m.line, expected);
  const length = m.line
    .slice(1)
    .reduce((sum, p, i) => sum + airDistance(m.line[i], p), 0);
  assert.ok(length > 2500 && length < 2600);
});
test("loop combines start and finish; near endpoints merge at 25m threshold", () => {
  assert.equal(detailMap(draft).pins.length, 1);
  assert.equal(detailMap(draft).pins[0].id, "start-finish");
  const q = {
    ...draft,
    route: {
      ...draft.route!,
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [8, 51],
          [8, 51.0001],
        ] as [number, number][],
      },
    },
  };
  assert.equal(detailMap(q).pins.length, 1);
});
test("open route has separate start and finish markers", () => {
  const q = {
    ...draft,
    route: {
      ...draft.route!,
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [8, 51],
          [8, 51.01],
        ] as [number, number][],
      },
    },
  };
  assert.equal(detailMap(q).pins.length, 2);
});
test("missing route never fabricates a line or route marker", () =>
  assert.deepEqual(
    detailMap(questRepository.getQuestDetails(published[0].id)!),
    { line: [], pins: [] },
  ));
test("navigation uses air distance, heading and safety label", () => {
  const n = navigationModel(
    { latitude: 51, longitude: 8 },
    { latitude: 51.001, longitude: 8 },
    90,
  );
  assert.ok(Math.abs(n.distanceM - 111.195) < 0.1);
  assert.equal(n.label, "Luftlinie");
  assert.equal(n.rotation, 270);
  assert.equal(n.warning, "Auf markierten Wegen bleiben");
});
test("public content contains no station coordinates, answers, route or draft", () => {
  const payload = JSON.stringify(published);
  for (const field of [
    "route",
    "stages",
    "gpsTrigger",
    "answer",
    "externsteine",
    "51.86905",
  ])
    assert.ok(!payload.includes(field), field);
});
test("nearby pins cluster without adding quest identities and separate on zoom", () => {
  const pins = globalMap(published).pins;
  const low = clusterPins(pins, () => ({ x: 0, y: 0 }));
  assert.equal(low.length, 1);
  assert.deepEqual(
    low[0].questIds,
    published.map((x) => x.id),
  );
  assert.equal(
    clusterPins(pins, (p) => ({
      x: p.longitude * 10000,
      y: p.latitude * 10000,
    })).length,
    2,
  );
  assert.equal(pins[0].questIds?.length, 1);
});
test("draft preview is absent outside development", () => {
  Object.assign(globalThis, { __DEV__: false });
  try {
    assert.equal(questRepository.getDraftQuestPreview(), undefined);
  } finally {
    Object.assign(globalThis, { __DEV__: true });
  }
});

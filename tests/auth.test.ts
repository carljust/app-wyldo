import test from "node:test";
import assert from "node:assert/strict";
import { parseBackendConfig } from "../src/infrastructure/supabase/config";
import { callbackCode } from "../src/features/auth/callback";
import {
  publishedRoute,
  publishedSummary,
} from "../src/infrastructure/supabase/questRepository";
const jwt = (role: string) =>
  "eyJhbGciOiJIUzI1NiJ9." +
  Buffer.from(JSON.stringify({ role })).toString("base64url") +
  ".test";
test("missing backend is explicit; no fake connection", () =>
  assert.equal(parseBackendConfig().status, "missing"));
test("client refuses secret and service_role keys", () => {
  for (const key of [
    "sb_secret_DO_NOT_USE",
    jwt("service_role"),
    jwt("authenticated"),
    "invalid",
  ])
    assert.equal(
      parseBackendConfig("https://example.supabase.co", key).status,
      "invalid",
    );
});
test("publishable and legacy anon keys accepted only with safe HTTPS project origin", () => {
  assert.equal(
    parseBackendConfig("https://example.supabase.co", jwt("anon")).status,
    "ready",
  );
  for (const url of [
    "http://example.supabase.co",
    "https://user:pass@example.supabase.co",
    "https://example.supabase.co/path",
    "https://example.supabase.co/?key=secret",
  ])
    assert.equal(parseBackendConfig(url, jwt("anon")).status, "invalid");
});
test("Google is disabled until explicitly configured", () => {
  const c = parseBackendConfig("https://example.supabase.co", jwt("anon"));
  assert.ok(c.status === "ready");
  assert.equal(c.googleEnabled, false);
});
test("callback uses authorization code and exact redirect origin/path", () => {
  assert.equal(
    callbackCode("wyldo://auth/callback?code=one", "wyldo://auth/callback"),
    "one",
  );
  assert.equal(
    callbackCode(
      "https://wyldo.example/auth/callback?code=one",
      "https://wyldo.example/auth/callback",
    ),
    "one",
  );
  for (const url of [
    "https://evil.example/auth/callback?code=x",
    "https://wyldo.example/other?code=x",
    "https://wyldo.example/auth/callback#access_token=x",
    "https://wyldo.example/auth/callback?code=a&code=b",
    "https://wyldo.example/auth/callback?error=access_denied",
    "https://wyldo.example/auth/callback",
  ])
    assert.throws(() =>
      callbackCode(url, "https://wyldo.example/auth/callback"),
    );
});
test("public summary projection drops routes, private stations and validation answers", () => {
  const q = publishedSummary({
    id: "one",
    title: "Quest",
    subtitle: "Story",
    start_latitude: 51,
    start_longitude: 8,
    recommended_age: 7,
    difficulty: "easy",
    stations: [{ secret: "answer" }],
    geometry: {},
    answer: "not_public",
  });
  assert.equal(q.kind, "editorial");
  assert.ok(!JSON.stringify(q).includes("not_public"));
  assert.deepEqual(
    Object.keys(q).sort(),
    [
      "id",
      "title",
      "subtitle",
      "startPoint",
      "recommendedAge",
      "difficulty",
      "status",
      "kind",
    ].sort(),
  );
});
test("remote data validation rejects malformed and unverified track geometry", () => {
  const route = {
    geometry: {
      type: "LineString",
      coordinates: [
        [8, 51],
        [8.1, 51.1],
      ],
    },
    source: "gpx_import",
    approval: "field_verified",
    route_version: "one",
  };
  assert.equal(publishedRoute(route).geometry.coordinates.length, 2);
  for (const r of [
    { ...route, approval: "draft" },
    {
      ...route,
      geometry: {
        type: "LineString",
        coordinates: [
          [8, 51],
          [Infinity, 52],
        ],
      },
    },
    {
      ...route,
      geometry: {
        type: "LineString",
        coordinates: [
          [8, 100],
          [8.1, 51],
        ],
      },
    },
  ])
    assert.throws(() => publishedRoute(r));
});

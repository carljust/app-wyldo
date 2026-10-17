import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  SqlProgressStore,
  type SqlDriver,
} from "../src/infrastructure/progress/sqlStore";
import { checkpointFor } from "../src/infrastructure/progress/types";
import { flushCheckpoints } from "../src/domain/navigation/sync";
import { createSession, reduceSession } from "../src/domain/navigation/session";
import { questRepository } from "../src/data/quests";
Object.assign(globalThis, { __DEV__: true });
const q = questRepository.getDraftQuestPreview()!;
const id = "10000000-0000-4000-8000-000000000001";
const owner = "11111111-1111-4111-8111-111111111111";
function driver(db: DatabaseSync): SqlDriver {
  return {
    async exec(sql) {
      db.exec(sql);
    },
    async run(sql, params) {
      db.prepare(sql).run(...params);
    },
    async first<T>(sql: string, params: (string | number | null)[]) {
      return (db.prepare(sql).get(...params) as T) ?? null;
    },
    async all<T>(sql: string, params: (string | number | null)[]) {
      return db.prepare(sql).all(...params) as T[];
    },
    async transaction<T>(fn: (tx: SqlDriver) => Promise<T>) {
      db.exec("BEGIN IMMEDIATE");
      try {
        const r = await fn(driver(db));
        db.exec("COMMIT");
        return r;
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
  };
}
const approved = {
  ...q,
  status: "published" as const,
  outdoorPlayable: true,
  questVersionId: id,
  route: { ...q.route!, approval: "field_verified" as const },
};
async function fixture(live = false) {
  const db = new DatabaseSync(":memory:");
  const store = await new SqlProgressStore(driver(db)).initialize();
  const before = createSession(
    live ? approved : q,
    live ? "live" : "simulation",
    live ? owner : null,
    id,
    100000,
  );
  const state = reduceSession(before, { type: "BEGIN", now: 100000 });
  await store.commit(state, null, "operation-1", checkpointFor(before, state));
  return { db, store, state };
}
test("SQLite session survives database close/reopen; pause and snapshot persist", async () => {
  const dir = mkdtempSync(join(tmpdir(), "wyldo-progress-"));
  try {
    const path = join(dir, "progress.db");
    let db = new DatabaseSync(path);
    let store = await new SqlProgressStore(driver(db)).initialize();
    const initial = createSession(q, "simulation", null, id, 100000);
    const started = reduceSession(initial, { type: "BEGIN", now: 100000 });
    await store.commit(started, null, "start", null);
    const paused = reduceSession(started, { type: "PAUSE", now: 100001 });
    await store.commit(paused, started.revision, "pause", null);
    db.close();
    db = new DatabaseSync(path);
    store = await new SqlProgressStore(driver(db)).initialize();
    assert.deepEqual(await store.load(paused.scope, q.id), paused);
    assert.deepEqual(await store.pending(paused.scope), []);
    db.close();
  } finally {
    rmSync(dir, { recursive: true });
  }
});
test("same operation retry is idempotent and stale revisions do not overwrite state", async () => {
  const { db, store, state } = await fixture();
  try {
    const paused = reduceSession(state, { type: "PAUSE", now: 100001 });
    await store.commit(paused, state.revision, "pause", null);
    assert.deepEqual(
      await store.commit(paused, state.revision, "pause", null),
      paused,
    );
    await assert.rejects(
      () =>
        store.commit(
          reduceSession(state, { type: "HEADING", heading: 90, now: 100002 }),
          state.revision,
          "different-op",
          null,
        ),
      /concurrent_update/,
    );
    assert.equal((await store.load(state.scope, q.id))?.paused, true);
  } finally {
    db.close();
  }
});
test("session, receipt and outbox commit atomically, and operations bind to scope", async () => {
  const { db, store, state } = await fixture(true);
  try {
    assert.equal((await store.pending(owner)).length, 1);
    assert.equal(await store.load("another-user", q.id), null);
    assert.deepEqual(await store.pending("another-user"), []);
    const paused = reduceSession(state, { type: "PAUSE", now: 100001 });
    db.exec(
      "CREATE TRIGGER reject_outbox BEFORE INSERT ON navigation_outbox BEGIN SELECT RAISE(ABORT,'test storage failure');END;",
    );
    await assert.rejects(() =>
      store.commit(
        paused,
        state.revision,
        "pause",
        checkpointFor(state, paused),
      ),
    );
    assert.equal((await store.load(owner, q.id))?.revision, 1);
    assert.equal(
      db.prepare("SELECT count(*) as n FROM navigation_receipts").get()?.n,
      1,
    );
    assert.equal((await store.pending(owner)).length, 1);
  } finally {
    db.close();
  }
});
test("simulation is never uploaded, even with a transport available", async () => {
  const { db, store, state } = await fixture();
  try {
    let calls = 0;
    const result = await flushCheckpoints(
      store,
      state.scope,
      {
        async send() {
          calls++;
          throw new Error();
        },
      },
      100000,
    );
    assert.equal(result.status, "simulation_local_only");
    assert.equal(calls, 0);
    assert.equal((await store.pending(state.scope)).length, 0);
  } finally {
    db.close();
  }
});
test("network failure retains same operation id; only a matching acknowledgement removes it", async () => {
  const { db, store } = await fixture(true);
  try {
    const seen: string[] = [];
    let fail = true;
    const transport = {
      async send(op: string) {
        seen.push(op);
        if (fail) throw new Error("offline");
        return { operationId: op, acknowledged: true };
      },
    };
    const first = await flushCheckpoints(store, owner, transport, 100000);
    assert.equal(first.pending, 1);
    fail = false;
    await flushCheckpoints(store, owner, transport, 100500);
    assert.equal(seen.length, 1);
    const last = await flushCheckpoints(store, owner, transport, 102000);
    assert.equal(last.pending, 0);
    assert.deepEqual(seen, ["operation-1", "operation-1"]);
  } finally {
    db.close();
  }
});
test("bad acknowledgements and missing server functions never falsely mark a checkpoint synced", async () => {
  const { db, store } = await fixture(true);
  try {
    await flushCheckpoints(
      store,
      owner,
      {
        async send() {
          return { operationId: "wrong", acknowledged: true };
        },
      },
      100000,
    );
    assert.equal((await store.pending(owner)).length, 1);
    await flushCheckpoints(
      store,
      owner,
      {
        async send() {
          throw new Error("server_not_configured");
        },
      },
      105000,
    );
    assert.equal(
      (await store.pending(owner))[0].lastError,
      "server_not_configured",
    );
    await store.acknowledge("other-user", "operation-1");
    assert.equal((await store.pending(owner)).length, 1);
  } finally {
    db.close();
  }
});

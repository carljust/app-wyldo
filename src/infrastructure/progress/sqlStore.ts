import {
  decodeSession,
  type NavigationSession,
} from "../../domain/navigation/session";
import {
  assertCommit,
  type Checkpoint,
  type PendingOperation,
  type ProgressStore,
} from "./types";
export interface SqlDriver {
  exec(sql: string): Promise<void>;
  run(sql: string, params: (string | number | null)[]): Promise<void>;
  first<T>(sql: string, params: (string | number | null)[]): Promise<T | null>;
  all<T>(sql: string, params: (string | number | null)[]): Promise<T[]>;
  transaction<T>(fn: (tx: SqlDriver) => Promise<T>): Promise<T>;
}
const schema = `
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS navigation_sessions(id TEXT PRIMARY KEY,scope TEXT NOT NULL,quest_id TEXT NOT NULL,revision INTEGER NOT NULL,state TEXT NOT NULL,UNIQUE(scope,quest_id));
CREATE TABLE IF NOT EXISTS navigation_receipts(id TEXT PRIMARY KEY,scope TEXT NOT NULL,session_id TEXT NOT NULL REFERENCES navigation_sessions(id));
CREATE TABLE IF NOT EXISTS navigation_outbox(id TEXT PRIMARY KEY,scope TEXT NOT NULL,session_id TEXT NOT NULL REFERENCES navigation_sessions(id),payload TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,next_attempt_at INTEGER NOT NULL DEFAULT 0,last_error TEXT);
CREATE INDEX IF NOT EXISTS navigation_outbox_scope ON navigation_outbox(scope,next_attempt_at);
`;
export class SqlProgressStore implements ProgressStore {
  constructor(private db: SqlDriver) {}
  async initialize() {
    await this.db.exec(schema);
    return this;
  }
  async load(scope: string, questId: string) {
    const row = await this.db.first<{ state: string }>(
      "SELECT state FROM navigation_sessions WHERE scope=? AND quest_id=?",
      [scope, questId],
    );
    return row ? decodeSession(row.state, scope, questId) : null;
  }
  async list(scope: string) {
    const rows = await this.db.all<{ state: string; quest_id: string }>(
      "SELECT state,quest_id FROM navigation_sessions WHERE scope=?",
      [scope],
    );
    return rows.map((row) => decodeSession(row.state, scope, row.quest_id));
  }
  async commit(
    state: NavigationSession,
    expectedRevision: number | null,
    operationId: string,
    checkpoint: Checkpoint | null,
  ) {
    assertCommit(state, expectedRevision, checkpoint);
    return this.db.transaction(async (tx) => {
      const receipt = await tx.first<{ scope: string; session_id: string }>(
        "SELECT scope,session_id FROM navigation_receipts WHERE id=?",
        [operationId],
      );
      const row = await tx.first<{ revision: number; state: string }>(
        "SELECT revision,state FROM navigation_sessions WHERE scope=? AND quest_id=?",
        [state.scope, state.quest.id],
      );
      if (receipt) {
        if (
          receipt.scope !== state.scope ||
          receipt.session_id !== state.id ||
          !row
        )
          throw new Error("operation_scope_mismatch");
        return decodeSession(row.state, state.scope, state.quest.id);
      }
      if ((row?.revision ?? null) !== expectedRevision)
        throw new Error("concurrent_update");
      await tx.run(
        "INSERT INTO navigation_sessions(id,scope,quest_id,revision,state) VALUES(?,?,?,?,?) ON CONFLICT(scope,quest_id) DO UPDATE SET revision=excluded.revision,state=excluded.state",
        [
          state.id,
          state.scope,
          state.quest.id,
          state.revision,
          JSON.stringify(state),
        ],
      );
      await tx.run(
        "INSERT INTO navigation_receipts(id,scope,session_id) VALUES(?,?,?)",
        [operationId, state.scope, state.id],
      );
      if (checkpoint)
        await tx.run(
          "INSERT INTO navigation_outbox(id,scope,session_id,payload) VALUES(?,?,?,?)",
          [operationId, state.scope, state.id, JSON.stringify(checkpoint)],
        );
      return state;
    });
  }
  async pending(scope: string) {
    const rows = await this.db.all<{
      id: string;
      scope: string;
      payload: string;
      attempts: number;
      next_attempt_at: number;
      last_error: string | null;
    }>("SELECT * FROM navigation_outbox WHERE scope=? ORDER BY rowid", [scope]);
    return rows.map((row) => ({
      id: row.id,
      scope: row.scope,
      payload: JSON.parse(row.payload) as Checkpoint,
      attempts: row.attempts,
      nextAttemptAt: row.next_attempt_at,
      lastError: row.last_error,
    }));
  }
  async acknowledge(scope: string, id: string) {
    await this.db.run("DELETE FROM navigation_outbox WHERE scope=? AND id=?", [
      scope,
      id,
    ]);
  }
  async postpone(scope: string, id: string, nextAt: number, reason: string) {
    await this.db.run(
      "UPDATE navigation_outbox SET attempts=attempts+1,next_attempt_at=?,last_error=? WHERE scope=? AND id=?",
      [nextAt, reason, scope, id],
    );
  }
}

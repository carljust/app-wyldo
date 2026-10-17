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
type Stored = { key: string; scope: string; questId: string; state: string };
const key = (scope: string, questId: string) =>
  JSON.stringify([scope, questId]);
class IndexedProgressStore implements ProgressStore {
  constructor(private db: IDBDatabase) {}
  private async read<T>(
    store: string,
    lookup: IDBValidKey,
    index?: string,
  ): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(store, "readonly");
      const source = index
        ? tx.objectStore(store).index(index)
        : tx.objectStore(store);
      const req = source.get(lookup);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  }
  async load(scope: string, questId: string) {
    const row = await this.read<Stored>("sessions", key(scope, questId));
    return row ? decodeSession(row.state, scope, questId) : null;
  }
  async list(scope: string): Promise<NavigationSession[]> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction("sessions", "readonly");
      const req = tx.objectStore("sessions").index("scope").getAll(scope);
      req.onsuccess = () => {
        try {
          resolve(
            (req.result as Stored[]).map((row) =>
              decodeSession(row.state, scope, row.questId),
            ),
          );
        } catch (error) {
          reject(error);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }
  async commit(
    state: NavigationSession,
    expectedRevision: number | null,
    id: string,
    checkpoint: Checkpoint | null,
  ): Promise<NavigationSession> {
    assertCommit(state, expectedRevision, checkpoint);
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(
        ["sessions", "receipts", "outbox"],
        "readwrite",
      );
      let result = state;
      let failure: unknown;
      tx.oncomplete = () => resolve(result);
      tx.onabort = () =>
        reject(failure ?? tx.error ?? new Error("storage_transaction_aborted"));
      tx.onerror = () => {};
      const receiptReq = tx.objectStore("receipts").get(id);
      receiptReq.onsuccess = () => {
        const sessionReq = tx
          .objectStore("sessions")
          .get(key(state.scope, state.quest.id));
        sessionReq.onsuccess = () => {
          try {
            const existing = sessionReq.result as Stored | undefined;
            const receipt = receiptReq.result as
              { scope: string; sessionId: string } | undefined;
            if (receipt) {
              if (
                receipt.scope !== state.scope ||
                receipt.sessionId !== state.id ||
                !existing
              )
                throw new Error("operation_scope_mismatch");
              result = decodeSession(
                existing.state,
                state.scope,
                state.quest.id,
              );
              return;
            }
            const old = existing
              ? decodeSession(existing.state, state.scope, state.quest.id)
              : null;
            if ((old?.revision ?? null) !== expectedRevision)
              throw new Error("concurrent_update");
            tx.objectStore("sessions").put({
              key: key(state.scope, state.quest.id),
              scope: state.scope,
              questId: state.quest.id,
              state: JSON.stringify(state),
            } satisfies Stored);
            tx.objectStore("receipts").put({
              id,
              scope: state.scope,
              sessionId: state.id,
            });
            if (checkpoint)
              tx.objectStore("outbox").put({
                id,
                scope: state.scope,
                payload: checkpoint,
                attempts: 0,
                nextAttemptAt: 0,
                lastError: null,
              } satisfies PendingOperation);
          } catch (error) {
            failure = error;
            tx.abort();
          }
        };
      };
    });
  }
  async pending(scope: string): Promise<PendingOperation[]> {
    return new Promise((resolve, reject) => {
      const req = this.db
        .transaction("outbox", "readonly")
        .objectStore("outbox")
        .index("scope")
        .getAll(scope);
      req.onsuccess = () => resolve(req.result as PendingOperation[]);
      req.onerror = () => reject(req.error);
    });
  }
  async acknowledge(scope: string, id: string) {
    await this.updateOperation(scope, id, () => null);
  }
  async postpone(scope: string, id: string, nextAt: number, reason: string) {
    await this.updateOperation(scope, id, (row) => ({
      ...row,
      attempts: row.attempts + 1,
      nextAttemptAt: nextAt,
      lastError: reason,
    }));
  }
  private async updateOperation(
    scope: string,
    id: string,
    update: (row: PendingOperation) => PendingOperation | null,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction("outbox", "readwrite");
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error);
      const req = tx.objectStore("outbox").get(id);
      req.onsuccess = () => {
        const row = req.result as PendingOperation | undefined;
        if (!row || row.scope !== scope) return;
        const next = update(row);
        if (next) tx.objectStore("outbox").put(next);
        else tx.objectStore("outbox").delete(id);
      };
    });
  }
}
let instance: Promise<ProgressStore> | undefined;
export function getProgressStore(): Promise<ProgressStore> {
  return (instance ??= new Promise((resolve, reject) => {
    const req = indexedDB.open("wyldo-progress", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const [name, keyPath] of [
        ["sessions", "key"],
        ["receipts", "id"],
        ["outbox", "id"],
      ]) {
        const store = db.createObjectStore(name, { keyPath });
        store.createIndex("scope", "scope");
      }
    };
    req.onsuccess = () => resolve(new IndexedProgressStore(req.result));
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("storage_upgrade_blocked"));
  }));
}

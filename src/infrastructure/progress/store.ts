import * as SQLite from "expo-sqlite";
import { SqlProgressStore, type SqlDriver } from "./sqlStore";
function driver(
  db: Pick<
    SQLite.SQLiteDatabase,
    "execAsync" | "runAsync" | "getFirstAsync" | "getAllAsync"
  >,
): SqlDriver {
  return {
    exec: (sql) => db.execAsync(sql),
    run: async (sql, params) => {
      await db.runAsync(sql, ...params);
    },
    first: async <T>(sql: string, params: (string | number | null)[]) =>
      db.getFirstAsync<T>(sql, ...params),
    all: async <T>(sql: string, params: (string | number | null)[]) =>
      db.getAllAsync<T>(sql, ...params),
    transaction: async <T>(fn: (tx: SqlDriver) => Promise<T>) => {
      let result!: T;
      await (db as SQLite.SQLiteDatabase).withExclusiveTransactionAsync(
        async (tx) => {
          result = await fn(driver(tx));
        },
      );
      return result;
    },
  };
}
let instance: Promise<SqlProgressStore> | undefined;
export function getProgressStore() {
  return (instance ??= SQLite.openDatabaseAsync("wyldo-progress.db").then(
    (db) => new SqlProgressStore(driver(db)).initialize(),
  ));
}

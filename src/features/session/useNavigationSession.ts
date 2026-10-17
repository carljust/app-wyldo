import { useCallback, useEffect, useRef, useState } from "react";
import * as Crypto from "expo-crypto";
import { AppState, Platform } from "react-native";
import type { QuestDetail } from "../../domain/quest";
import {
  createSession,
  reduceSession,
  type Command,
  type NavigationSession,
} from "../../domain/navigation/session";
import { getProgressStore } from "../../infrastructure/progress/store";
import { checkpointFor } from "../../infrastructure/progress/types";
import { flushCheckpoints } from "../../domain/navigation/sync";
import { checkpointTransport } from "../../infrastructure/progress/transport";
export function useNavigationSession(
  questId: string,
  q: QuestDetail | undefined,
  mode: "simulation" | "live",
  ownerId: string | null,
) {
  const [state, setState] = useState<NavigationSession | null>(null);
  const ref = useRef<NavigationSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sync, setSync] = useState({ status: "local", pending: 0 });
  const tail = useRef(Promise.resolve());
  const flushing = useRef(false);
  const context = useRef("");
  const scope = mode === "simulation" ? "dev-simulation" : (ownerId ?? "");
  const contextKey = JSON.stringify([scope, questId, mode]);
  useEffect(() => {
    let alive = true;
    context.current = contextKey;
    ref.current = null;
    setState(null);
    setLoading(true);
    setError(null);
    if ((mode === "simulation" && !__DEV__) || !scope) {
      setLoading(false);
      setError(
        mode === "live"
          ? "Bitte zuerst anmelden."
          : "Simulation ist nur im Entwicklungsmodus verfügbar.",
      );
      return;
    }
    (async () => {
      const store = await getProgressStore();
      let saved = await store.load(scope, questId);
      if (!saved && q) {
        const initial = createSession(
          q,
          mode,
          ownerId,
          Crypto.randomUUID(),
          Date.now(),
        );
        const next = reduceSession(initial, { type: "BEGIN", now: Date.now() });
        saved = await store.commit(
          next,
          null,
          Crypto.randomUUID(),
          checkpointFor(initial, next),
        );
      }
      if (alive) {
        ref.current = saved;
        setState(saved);
        setLoading(false);
      }
    })().catch(() => {
      if (alive) {
        setLoading(false);
        setError(
          "Lokaler Spielstand konnte nicht geladen werden. Vorhandene Daten bleiben erhalten.",
        );
      }
    });
    return () => {
      alive = false;
    };
  }, [contextKey, questId, q, mode, ownerId, scope]);
  const synchronize = useCallback(async () => {
    if (flushing.current || !scope || !ref.current) return;
    if (mode === "simulation") {
      setSync({ status: "simulation_local_only", pending: 0 });
      return;
    }
    if (
      Platform.OS === "web"
        ? document.visibilityState !== "visible"
        : AppState.currentState !== "active"
    )
      return;
    flushing.current = true;
    try {
      const store = await getProgressStore();
      const result = await flushCheckpoints(
        store,
        scope,
        ownerId ? checkpointTransport : null,
        Date.now(),
      );
      if (context.current === contextKey)
        setSync({ status: result.status, pending: result.pending });
    } catch {
      if (context.current === contextKey)
        setSync((prev) => ({ ...prev, status: "pending" }));
    } finally {
      flushing.current = false;
    }
  }, [scope, mode, ownerId, contextKey]);
  useEffect(() => {
    if (!state) return;
    void synchronize();
    const timer = setInterval(() => void synchronize(), 10000);
    return () => clearInterval(timer);
  }, [state?.id, synchronize]);
  const dispatch = useCallback(
    (command: Command): Promise<boolean> => {
      let outcome = false;
      const task = tail.current.then(async () => {
        if (context.current !== contextKey) return;
        const current = ref.current;
        if (!current) return;
        if (current.paused && ["FIX", "HEADING"].includes(command.type)) return;
        setBusy(true);
        setError(null);
        try {
          const next = reduceSession(current, command);
          const store = await getProgressStore();
          const committed = await store.commit(
            next,
            current.revision,
            Crypto.randomUUID(),
            checkpointFor(current, next),
          );
          if (context.current !== contextKey) return;
          ref.current = committed;
          setState(committed);
          outcome = true;
          void synchronize();
        } catch (cause) {
          if (context.current !== contextKey) return;
          const reason = cause instanceof Error ? cause.message : "";
          setError(
            reason === "arrival_not_confirmed"
              ? "Für den Start fehlen frische, genaue Standortmessungen."
              : reason === "concurrent_update"
                ? "Der Spielstand wurde in einer anderen Ansicht verändert. Bitte die Navigation erneut öffnen."
                : "Aktion konnte nicht gespeichert werden. Der vorherige Spielstand bleibt erhalten.",
          );
        } finally {
          if (context.current === contextKey) setBusy(false);
        }
      });
      tail.current = task.catch(() => {});
      return task.then(() => outcome);
    },
    [contextKey, synchronize],
  );
  const visibleState =
    state?.scope === scope && state.quest.id === questId && state.mode === mode
      ? state
      : null;
  return {
    state: visibleState,
    loading,
    busy,
    error,
    sync,
    dispatch,
    synchronize,
  };
}

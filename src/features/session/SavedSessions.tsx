import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Button, Label, Notice, Panel, Title } from "../../components/ui";
import { getProgressStore } from "../../infrastructure/progress/store";
import { useAuth } from "../auth/AuthProvider";
import type { NavigationSession } from "../../domain/navigation/session";
export function SavedSessions() {
  const ownerId = useAuth().session?.user.id ?? null;
  const [sessions, setSessions] = useState<NavigationSession[]>([]);
  const [error, setError] = useState(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const store = await getProgressStore();
        const scopes = [
          ...(__DEV__ ? ["dev-simulation"] : []),
          ...(ownerId ? [ownerId] : []),
        ];
        const lists = await Promise.all(
          scopes.map((scope) => store.list(scope)),
        );
        if (active) {
          setSessions(lists.flat());
          setError(false);
        }
      })().catch(() => {
        if (active) setError(true);
      });
      return () => {
        active = false;
      };
    }, [ownerId]),
  );
  if (error)
    return (
      <Notice>
        Gespeicherte Spielstände konnten nicht gelesen werden. Daten bleiben
        erhalten.
      </Notice>
    );
  const visibleSessions = sessions.filter((state) =>
    state.mode === "simulation"
      ? __DEV__ && state.scope === "dev-simulation"
      : state.scope === ownerId,
  );
  if (!visibleSessions.length) return null;
  return (
    <Panel>
      <Title small>Dein Abenteuer fortsetzen</Title>
      {visibleSessions.map((state) => (
        <Panel key={state.id}>
          <Label>{state.quest.title}</Label>
          <Label muted>
            {state.mode === "simulation"
              ? "Lokale Simulation"
              : "Privater Spielstand"}{" "}
            · {state.paused ? "pausiert" : "gespeichert"} · Stand{" "}
            {state.revision}
          </Label>
          <Button
            label={`Fortsetzen: ${state.quest.title}`}
            onPress={() =>
              router.push(`/navigate/${state.quest.id}?mode=${state.mode}`)
            }
          />
        </Panel>
      ))}
    </Panel>
  );
}

import { useEffect, useState } from "react";
import type { QuestDetail, QuestSummary } from "../domain/quest";
import { supabase } from "../infrastructure/supabase/client";
import { SupabaseQuestRepository } from "../infrastructure/supabase/questRepository";
import { getVisibleQuest, questRepository } from "./quests";
const remote = supabase ? new SupabaseQuestRepository(supabase) : null;
export function useQuestCatalog() {
  const [quests, setQuests] = useState<QuestSummary[]>(() =>
    remote ? [] : questRepository.listPublishedQuests(),
  );
  const [loading, setLoading] = useState(!!remote);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!remote) return;
    let live = true;
    setLoading(true);
    setError(false);
    remote
      .listPublishedQuests()
      .then((data) => {
        if (live) setQuests(data);
      })
      .catch(() => {
        if (live) setError(true);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [attempt]);
  return {
    quests,
    loading,
    error,
    source: remote ? "supabase" : "fixture",
    retry: () => setAttempt((n) => n + 1),
  };
}
export function useQuestDetail(id: string) {
  const local = !remote || id === "externsteine";
  const [quest, setQuest] = useState<QuestDetail | undefined>(() =>
    local ? getVisibleQuest(id) : undefined,
  );
  const [loading, setLoading] = useState(!local);
  const [error, setError] = useState(false);
  useEffect(() => {
    let live = true;
    setError(false);
    if (local) {
      setQuest(getVisibleQuest(id));
      setLoading(false);
      return;
    }
    setQuest(undefined);
    setLoading(true);
    remote!
      .getQuestDetails(id)
      .then((q) => {
        if (live) setQuest(q);
      })
      .catch(() => {
        if (live) setError(true);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [id, local]);
  return { quest, loading, error };
}

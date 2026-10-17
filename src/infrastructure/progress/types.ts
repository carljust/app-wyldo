import type { NavigationSession, Phase } from "../../domain/navigation/session";
export type Checkpoint = {
  sessionId: string;
  questVersionId: string;
  revision: number;
  phase: Phase;
  paused: boolean;
};
export type PendingOperation = {
  id: string;
  scope: string;
  payload: Checkpoint;
  attempts: number;
  nextAttemptAt: number;
  lastError: string | null;
};
export interface ProgressStore {
  load(scope: string, questId: string): Promise<NavigationSession | null>;
  list(scope: string): Promise<NavigationSession[]>;
  commit(
    state: NavigationSession,
    expectedRevision: number | null,
    operationId: string,
    checkpoint: Checkpoint | null,
  ): Promise<NavigationSession>;
  pending(scope: string): Promise<PendingOperation[]>;
  acknowledge(scope: string, operationId: string): Promise<void>;
  postpone(
    scope: string,
    operationId: string,
    nextAttemptAt: number,
    reason: string,
  ): Promise<void>;
}
export function checkpointFor(
  previous: NavigationSession,
  next: NavigationSession,
): Checkpoint | null {
  if (
    next.mode === "simulation" ||
    !next.quest.questVersionId ||
    (previous.phase === next.phase && previous.paused === next.paused)
  )
    return null;
  return {
    sessionId: next.id,
    questVersionId: next.quest.questVersionId,
    revision: next.revision,
    phase: next.phase,
    paused: next.paused,
  };
}
export function assertCommit(
  state: NavigationSession,
  expectedRevision: number | null,
  checkpoint: Checkpoint | null,
) {
  if (state.revision !== (expectedRevision ?? 0) + 1)
    throw new Error("invalid_revision");
  if (
    checkpoint &&
    (state.mode !== "live" ||
      checkpoint.sessionId !== state.id ||
      checkpoint.questVersionId !== state.quest.questVersionId ||
      checkpoint.revision !== state.revision ||
      checkpoint.phase !== state.phase ||
      checkpoint.paused !== state.paused)
  )
    throw new Error("invalid_checkpoint");
}

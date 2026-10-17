import type {
  ProgressStore,
  Checkpoint,
} from "../../infrastructure/progress/types";
export interface CheckpointTransport {
  send(
    operationId: string,
    payload: Checkpoint,
    ownerId: string,
  ): Promise<{ operationId: string; acknowledged: boolean }>;
}
export async function flushCheckpoints(
  store: ProgressStore,
  scope: string,
  transport: CheckpointTransport | null,
  now: number,
) {
  if (scope === "dev-simulation")
    return { sent: 0, pending: 0, status: "simulation_local_only" };
  const pending = await store.pending(scope);
  let sent = 0;
  if (!transport)
    return { sent, pending: pending.length, status: "authentication_required" };
  for (const op of pending) {
    if (op.nextAttemptAt > now) continue;
    try {
      const ack = await transport.send(op.id, op.payload, scope);
      if (!ack.acknowledged || ack.operationId !== op.id)
        throw new Error("invalid_acknowledgement");
      await store.acknowledge(scope, op.id);
      sent++;
    } catch (error) {
      const unavailable =
        error instanceof Error && error.message === "server_not_configured";
      await store.postpone(
        scope,
        op.id,
        now + Math.min(300000, 1000 * 2 ** Math.min(op.attempts, 8)),
        unavailable ? "server_not_configured" : "retry_needed",
      );
      break;
    }
  }
  const remaining = await store.pending(scope);
  return {
    sent,
    pending: remaining.length,
    status: remaining.length ? "pending" : "synced",
  };
}

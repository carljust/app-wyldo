import type { CheckpointTransport } from "../../domain/navigation/sync";
import { supabase } from "../supabase/client";
export const checkpointTransport: CheckpointTransport = {
  async send(id, payload, ownerId) {
    if (!supabase) throw new Error("server_not_configured");
    const { data, error } = await supabase.rpc("save_navigation_checkpoint", {
      p_owner_id: ownerId,
      p_operation_id: id,
      p_session_id: payload.sessionId,
      p_quest_version_id: payload.questVersionId,
      p_revision: payload.revision,
      p_phase: payload.phase,
      p_paused: payload.paused,
    });
    if (error)
      throw new Error(
        error.code === "PGRST202"
          ? "server_not_configured"
          : "checkpoint_sync_failed",
      );
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error("invalid_acknowledgement");
    return {
      operationId: data.operationId,
      acknowledged: data.acknowledged === true,
    };
  },
};

import { useEffect, useState } from "react";
import { AppState } from "react-native";
import type { QuestDetail } from "../../domain/quest";
import { startApprovedLocation } from "../../domain/navigation/location";
import { foregroundLocation } from "../../infrastructure/progress/location";
import type { Command } from "../../domain/navigation/session";
export function useLiveLocation(
  active: boolean,
  q: QuestDetail | undefined,
  ownerId: string | null,
  dispatch: (command: Command) => Promise<boolean>,
  stop: () => void,
) {
  const [status, setStatus] = useState("inactive");
  useEffect(() => {
    if (!active || !q) {
      setStatus("inactive");
      return;
    }
    let alive = true;
    let cleanup: (() => void) | undefined;
    let lastHeadingAt = 0;
    setStatus("requesting");
    startApprovedLocation(
      foregroundLocation,
      q,
      ownerId,
      (fix) => {
        if (alive) void dispatch({ type: "FIX", fix, now: Date.now() });
      },
      (heading) => {
        const now = Date.now();
        if (alive && now - lastHeadingAt >= 1000) {
          lastHeadingAt = now;
          void dispatch({ type: "HEADING", heading, now });
        }
      },
    )
      .then((remove) => {
        if (!alive) {
          remove();
          return;
        }
        cleanup = remove;
        setStatus("active");
      })
      .catch((error) => {
        if (alive)
          setStatus(
            error instanceof Error &&
              error.message === "location_permission_denied"
              ? "denied"
              : "unavailable",
          );
      });
    const listener = AppState.addEventListener("change", (value) => {
      if (value !== "active") stop();
    });
    return () => {
      alive = false;
      cleanup?.();
      listener.remove();
    };
  }, [active, q, ownerId, dispatch, stop]);
  return status;
}

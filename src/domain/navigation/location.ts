import type { QuestDetail } from "../quest";
import { canUseLiveNavigation, type PositionFix } from "./session";
export type LocationReading = {
  point: { latitude: number; longitude: number };
  accuracyM: number;
  timestamp: number;
};
export interface ForegroundLocationProvider {
  requestPermission(): Promise<boolean>;
  watchPosition(callback: (fix: PositionFix) => void): Promise<() => void>;
  watchHeading(callback: (heading: number | null) => void): Promise<() => void>;
}
export async function startApprovedLocation(
  provider: ForegroundLocationProvider,
  quest: QuestDetail,
  ownerId: string | null,
  onFix: (fix: PositionFix) => void,
  onHeading: (heading: number | null) => void,
) {
  if (!canUseLiveNavigation(quest, ownerId))
    throw new Error("live_navigation_not_approved");
  if (!(await provider.requestPermission()))
    throw new Error("location_permission_denied");
  const stopPosition = await provider.watchPosition(onFix);
  try {
    const stopHeading = await provider.watchHeading(onHeading);
    return () => {
      stopPosition();
      stopHeading();
    };
  } catch {
    onHeading(null);
    return stopPosition;
  }
}

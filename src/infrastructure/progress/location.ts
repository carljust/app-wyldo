import * as Location from "expo-location";
import type { ForegroundLocationProvider } from "../../domain/navigation/location";
export const foregroundLocation: ForegroundLocationProvider = {
  async requestPermission() {
    const result = await Location.requestForegroundPermissionsAsync();
    return result.status === "granted";
  },
  async watchPosition(callback) {
    const watcher = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 3,
      },
      (position) => {
        if (position.coords.accuracy === null) return;
        callback({
          point: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          accuracyM: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
    );
    return () => watcher.remove();
  },
  async watchHeading(callback) {
    const watcher = await Location.watchHeadingAsync((heading) => {
      const value =
        heading.trueHeading >= 0 ? heading.trueHeading : heading.magHeading;
      callback(heading.accuracy >= 2 && value >= 0 ? value % 360 : null);
    });
    return () => watcher.remove();
  },
};

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
// Native sessions live in platform encrypted storage. Web uses same-origin localStorage.
// Never persist sessions in source files, logs, URL fragments or fixture data.
export const sessionStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web")
      return typeof window === "undefined"
        ? null
        : window.localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined")
        window.localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

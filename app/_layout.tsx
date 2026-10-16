import { AuthProvider } from "../src/features/auth/AuthProvider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0D261F" },
          }}
        />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

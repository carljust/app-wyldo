import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../../infrastructure/supabase/client";
import { backendConfig } from "../../infrastructure/supabase/config";
import { callbackCode } from "./callback";
export function authRedirect() {
  return Platform.OS === "web"
    ? `${window.location.origin}/auth/callback`
    : Linking.createURL("auth/callback", { scheme: "wyldo" });
}
let exchange: { code: string; result: Promise<void> } | undefined;
export async function completeAuthentication(url: string) {
  if (!supabase) throw new Error("Backend not configured");
  const code = callbackCode(url, authRedirect());
  if (exchange?.code === code) return exchange.result;
  const result = supabase.auth
    .exchangeCodeForSession(code)
    .then(({ error }) => {
      if (error) throw error;
    });
  exchange = { code, result };
  return result;
}
export async function sendEmailLink(email: string) {
  if (!supabase) throw new Error("Backend not configured");
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: authRedirect(), shouldCreateUser: true },
  });
  if (error) throw error;
}
export async function signInWithGoogle() {
  if (
    !supabase ||
    backendConfig.status !== "ready" ||
    !backendConfig.googleEnabled
  )
    throw new Error("Provider not configured");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: authRedirect(), skipBrowserRedirect: true },
  });
  if (error || !data.url) throw error ?? new Error("No authorization URL");
  if (Platform.OS === "web") {
    window.location.assign(data.url);
    return;
  }
  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    authRedirect(),
  );
  if (result.type === "success") await completeAuthentication(result.url);
}
export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

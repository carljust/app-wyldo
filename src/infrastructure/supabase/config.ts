export type BackendConfig =
  | { status: "missing"; message: string }
  | { status: "invalid"; message: string }
  | {
      status: "ready";
      url: string;
      publishableKey: string;
      googleEnabled: boolean;
    };
export function parseBackendConfig(
  url?: string,
  key?: string,
  google?: string,
): BackendConfig {
  if (!url || !key)
    return {
      status: "missing",
      message:
        "Supabase-Projekt noch nicht verbunden. Die lokale Vorschau bleibt nutzbar.",
    };
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.pathname !== "/" ||
      parsed.search ||
      parsed.hash
    )
      throw new Error();
  } catch {
    return {
      status: "invalid",
      message: "Die Supabase-Projekt-URL muss eine gültige HTTPS-Adresse sein.",
    };
  }
  let allowed = key.startsWith("sb_publishable_") && key.length > 20;
  if (key.startsWith("eyJ")) {
    try {
      const payload = JSON.parse(
        atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      allowed = payload.role === "anon";
    } catch {
      allowed = false;
    }
  }
  if (!allowed)
    return {
      status: "invalid",
      message:
        "Nur ein Supabase Publishable Key oder älterer anon-Key darf im Client verwendet werden. Keine geheimen Server-Schlüssel.",
    };
  return {
    status: "ready",
    url: new URL(url).origin,
    publishableKey: key,
    googleEnabled: google === "true",
  };
}
// Expo only inlines explicit process.env.EXPO_PUBLIC_* property accesses.
export const backendConfig = parseBackendConfig(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  process.env.EXPO_PUBLIC_GOOGLE_AUTH_ENABLED,
);

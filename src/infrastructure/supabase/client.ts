import "./crypto";
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { backendConfig } from "./config";
import { sessionStorage } from "./storage";
export const supabase =
  backendConfig.status === "ready"
    ? createClient(backendConfig.url, backendConfig.publishableKey, {
        auth: {
          storage: sessionStorage,
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          flowType: "pkce",
        },
      })
    : null;

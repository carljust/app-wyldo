import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AppState, Platform } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../infrastructure/supabase/client";
import { backendConfig } from "../../infrastructure/supabase/config";
type AuthState = {
  session: Session | null;
  loading: boolean;
  error: string | null;
  configured: boolean;
};
const Context = createContext<AuthState>({
  session: null,
  loading: true,
  error: null,
  configured: false,
});
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    loading: !!supabase,
    error: null,
    configured: !!supabase,
  });
  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    let authChanged = false;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      authChanged = true;
      if (alive)
        setState({ session, loading: false, error: null, configured: true });
    });
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (alive && !authChanged)
          setState({
            session: data.session,
            loading: false,
            error: error
              ? "Gespeicherte Anmeldung konnte nicht geladen werden. Bitte erneut anmelden."
              : null,
            configured: true,
          });
      })
      .catch(() => {
        if (alive)
          setState({
            session: null,
            loading: false,
            error: "Anmeldung konnte nicht geladen werden.",
            configured: true,
          });
      });
    const listener =
      Platform.OS !== "web"
        ? AppState.addEventListener("change", (status) => {
            if (status === "active") supabase?.auth.startAutoRefresh();
            else supabase?.auth.stopAutoRefresh();
          })
        : null;
    return () => {
      alive = false;
      subscription.unsubscribe();
      listener?.remove();
      if (Platform.OS !== "web") supabase?.auth.stopAutoRefresh();
    };
  }, []);
  return <Context.Provider value={state}>{children}</Context.Provider>;
}
export function useAuth() {
  return useContext(Context);
}
export { backendConfig };

import { router } from "expo-router";
import { useAuth, backendConfig } from "../auth/AuthProvider";
import { signOut } from "../auth/actions";
import { useState } from "react";
import { Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Badge,
  Button,
  Icon,
  Label,
  Notice,
  Panel,
  Screen,
  Title,
  s,
} from "../../components/ui";
import { colors as c } from "../../theme/tokens";
export default function Profile() {
  const [reduce, setReduce] = useState(true);
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function logout() {
    setBusy(true);
    setError(false);
    try {
      await signOut();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.deep }} edges={["top"]}>
      <Screen>
        <Badge>
          {auth.configured ? "DEIN FAMILIENPROFIL" : "PROFIL · VORSCHAU"}
        </Badge>
        <Title>Hallo, Entdeckerfamilie.</Title>
        <Panel>
          <Icon name="person-circle-outline" color={c.gold} size={56} />
          <Label>
            {auth.loading
              ? "Anmeldung wird geladen …"
              : auth.session
                ? "Angemeldet"
                : auth.configured
                  ? "Noch nicht angemeldet"
                  : "Lokale Designvorschau"}
          </Label>
          <Label muted>
            {auth.session
              ? auth.session.user.email
              : "Kein Konto verbunden. Keine Standortaufzeichnungen."}
          </Label>
          {auth.session ? (
            <Button
              label={busy ? "Abmeldung läuft …" : "Abmelden"}
              disabled={busy}
              onPress={logout}
            />
          ) : (
            <Button
              label="Anmelden"
              disabled={auth.loading}
              onPress={() => router.push("/auth")}
            />
          )}
          {error && (
            <Notice>
              Abmeldung fehlgeschlagen. Bitte Verbindung prüfen und erneut
              versuchen.
            </Notice>
          )}
          {auth.error && <Notice>{auth.error}</Notice>}
        </Panel>
        <Panel>
          <View style={[s.row, { justifyContent: "space-between" }]}>
            <View style={{ flex: 1 }}>
              <Label>Ruhige Darstellung</Label>
              <Label muted>Statische Vorschau ohne Animationen</Label>
            </View>
            <Switch
              accessibilityLabel="Ruhige Darstellung"
              value={reduce}
              onValueChange={setReduce}
              trackColor={{ true: c.pine, false: c.border }}
              thumbColor={c.gold}
            />
          </View>
          <Label muted>
            {reduce
              ? "Reduzierte Bewegung ausgewählt."
              : "Animationen bleiben in dieser Phase deaktiviert."}
          </Label>
        </Panel>
        <Notice>
          {backendConfig.status === "ready"
            ? "Standort bleibt aus. Anmeldung aktiviert keine Quest und vergibt keine Belohnungen."
            : backendConfig.message}
        </Notice>
        <Panel>
          <Label>Datenschutz im Konzept</Label>
          <Label muted>
            Später: Elternkonto, Einwilligung, Datenexport und Löschung. Keine
            Hintergrundortung. Keine geheimen Lösungen im Client.
          </Label>
        </Panel>
      </Screen>
    </SafeAreaView>
  );
}

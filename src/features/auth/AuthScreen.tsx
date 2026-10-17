import { useState } from "react";
import { TextInput, View, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Badge,
  Button,
  Fox,
  Label,
  Notice,
  Panel,
  Screen,
  Title,
  s,
} from "../../components/ui";
import { colors as c } from "../../theme/tokens";
import { backendConfig, useAuth } from "./AuthProvider";
import { sendEmailLink, signInWithGoogle } from "./actions";
export default function AuthScreen() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = backendConfig.status === "ready";
  async function run(action: () => Promise<void>, emailAction = false) {
    setBusy(true);
    setError(null);
    try {
      await action();
      if (emailAction) setSent(true);
    } catch {
      setError(
        "Anmeldung konnte nicht abgeschlossen werden. Prüfe deine Verbindung und versuche es erneut.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.deep }}>
      <Screen>
        <Button
          label="Zurück zum Profil"
          secondary
          icon="arrow-back"
          onPress={() => router.replace("/profile")}
        />
        <Badge>DEIN FAMILIENABENTEUER</Badge>
        <View style={{ alignItems: "center" }}>
          <Fox size={160} />
        </View>
        <Title>Gemeinsam beginnt die Geschichte.</Title>
        <Label>
          Anmeldung für erwachsene Begleitpersonen. Dein Familienprofil
          verbindet später eure Abenteuer und Erinnerungen.
        </Label>
        {backendConfig.status !== "ready" && (
          <Notice>{backendConfig.message}</Notice>
        )}
        {auth.session ? (
          <Panel>
            <Label>Du bist angemeldet.</Label>
            <Button
              label="Zum Profil"
              onPress={() => router.replace("/profile")}
            />
          </Panel>
        ) : (
          <Panel light>
            <Text style={[s.ink, { fontSize: 20, fontWeight: "700" }]}>
              Mit E-Mail anmelden
            </Text>
            <Text style={s.ink}>
              Du erhältst einen sicheren Anmeldelink. Kein Passwort nötig.
            </Text>
            <TextInput
              accessibilityLabel="E-Mail-Adresse"
              placeholder="E-Mail-Adresse"
              placeholderTextColor="#6D7769"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setSent(false);
              }}
              editable={!busy && ready}
              style={styles.input}
            />
            <Button
              label={
                busy
                  ? "Bitte warten …"
                  : sent
                    ? "Anmeldelink erneut senden"
                    : "Anmeldelink senden"
              }
              disabled={
                !ready ||
                busy ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
              }
              onPress={() => run(() => sendEmailLink(email.trim()), true)}
            />
            {sent && (
              <Text accessibilityRole="alert" style={s.ink}>
                Falls die Adresse verwendet werden kann, erhältst du einen Link.
                Öffne ihn auf diesem Gerät. Bitte auch den Spamordner prüfen.
              </Text>
            )}
            <Button
              label={
                backendConfig.status === "ready" && backendConfig.googleEnabled
                  ? "Mit Google anmelden"
                  : "Google · Provider noch nicht eingerichtet"
              }
              secondary
              disabled={
                backendConfig.status !== "ready" ||
                !backendConfig.googleEnabled ||
                busy
              }
              onPress={() => run(signInWithGoogle)}
            />
          </Panel>
        )}
        {error && <Notice>{error}</Notice>}
        {auth.error && <Notice>{auth.error}</Notice>}
        <Notice>
          Standort bleibt aus. Anmeldung startet keine Quest und vergibt keine
          XP.
        </Notice>
      </Screen>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  input: {
    minHeight: 52,
    padding: 14,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    color: c.ink,
    fontSize: 16,
    backgroundColor: "#FFFFFF80",
  },
});

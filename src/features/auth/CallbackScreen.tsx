import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { Button, Label, Notice, Screen, Title } from "../../components/ui";
import { completeAuthentication } from "./actions";
export default function CallbackScreen() {
  const incoming = Linking.useURL();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  useEffect(() => {
    let active = true;
    const url = Platform.OS === "web" ? window.location.href : incoming;
    if (!url) return;
    completeAuthentication(url)
      .then(() => {
        if (Platform.OS === "web")
          window.history.replaceState(null, "", window.location.pathname);
        if (active) setStatus("success");
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [incoming]);
  return (
    <Screen>
      <Title>
        {status === "loading"
          ? "Anmeldung wird geprüft …"
          : status === "success"
            ? "Willkommen bei Wyldo!"
            : "Anmeldelink nicht nutzbar"}
      </Title>
      {status === "error" && (
        <Notice>
          Der Link ist ungültig, abgelaufen oder wurde auf einem anderen Gerät
          angefordert. Bitte fordere einen neuen Link an.
        </Notice>
      )}
      {status === "loading" ? (
        <Label>Bitte einen Moment warten.</Label>
      ) : (
        <Button
          label={status === "success" ? "Zum Profil" : "Erneut anmelden"}
          onPress={() =>
            router.replace(status === "success" ? "/profile" : "/auth")
          }
        />
      )}
    </Screen>
  );
}

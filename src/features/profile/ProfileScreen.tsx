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
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.deep }} edges={["top"]}>
      <Screen>
        <Badge>PROFIL · VORSCHAU</Badge>
        <Title>Hallo, Entdeckerfamilie.</Title>
        <Panel>
          <Icon name="person-circle-outline" color={c.gold} size={56} />
          <Label>Lokale Designvorschau</Label>
          <Label muted>
            Kein Konto verbunden. Keine personenbezogenen Daten oder
            Standortaufzeichnungen.
          </Label>
          <Button label="Anmelden · in späterer Phase" disabled />
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
          Standort bleibt aus. Live-GPS, Google-Anmeldung und Supabase sind noch
          nicht freigegeben.
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

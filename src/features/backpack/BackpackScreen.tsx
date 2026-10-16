import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Badge,
  Fox,
  Icon,
  Label,
  Panel,
  Screen,
  Title,
  s,
} from "../../components/ui";
import { colors as c } from "../../theme/tokens";
export default function Backpack() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.deep }} edges={["top"]}>
      <Screen>
        <Badge>DEIN ABENTEUER-INVENTAR · VORSCHAU</Badge>
        <Title>Ein Rucksack voller Geschichten.</Title>
        <View style={{ alignItems: "center" }}>
          <Fox size={200} />
        </View>
        <Panel light>
          <Text style={[s.ink, { fontSize: 22, fontWeight: "700" }]}>
            Das erste Kapitel wartet.
          </Text>
          <Text style={s.ink}>
            Hier finden später deine Steinsiegel, Erinnerungen und Abzeichen
            ihren Platz.
          </Text>
        </Panel>
        <Panel>
          <Icon name="lock-closed-outline" color={c.gold} />
          <Label>Noch keine Fundstücke</Label>
          <Label muted>
            Inventar, XP und Questfortschritt werden erst nach der
            Designfreigabe entwickelt. Diese Vorschau vergibt keine Belohnungen.
          </Label>
        </Panel>
      </Screen>
    </SafeAreaView>
  );
}

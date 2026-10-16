import { useQuestCatalog } from "../../data/useQuests";
import { useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Badge,
  Button,
  Fox,
  Icon,
  Label,
  Notice,
  Panel,
  Screen,
  Title,
  s,
} from "../../components/ui";
import AdventureLandscape from "../../components/AdventureLandscape";
import QuestCard from "../../components/QuestCard";
import { questRepository } from "../../data/quests";
import { colors as c, fonts } from "../../theme/tokens";
export default function Discover() {
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(false);
  const draft = questRepository.getDraftQuestPreview();
  const catalog = useQuestCatalog();
  const quests = catalog.quests.filter((q) =>
    q.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.deep }} edges={["top"]}>
      <Screen>
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <View>
            <Text style={s.eyebrow}>DEIN NÄCHSTES ABENTEUER</Text>
            <Text style={styles.logo}>
              Wyldo<Text style={{ color: c.gold }}>✦</Text>
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profil öffnen"
            onPress={() => router.push("/profile")}
            style={styles.profile}
          >
            <Icon name="person-outline" color={c.gold} />
          </Pressable>
        </View>
        <View style={styles.hero}>
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.35,
            }}
          >
            <AdventureLandscape />
          </View>
          <View style={styles.sun} />
          <View style={{ position: "absolute", bottom: 0, right: -8 }}>
            <Fox size={width < 350 ? 174 : 210} />
          </View>
          <View style={{ width: "60%", gap: 12 }}>
            <Badge>RAUS INS ABENTEUER</Badge>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: width < 350 ? 26 : 30,
                lineHeight: width < 350 ? 30 : 35,
                fontWeight: "700",
                color: c.cream,
              }}
            >
              Draußen wartet ein Abenteuer.
            </Text>
            <Text style={[s.text, { fontSize: 13 }]}>
              Augen auf. Neugier an. Entdecke deine nächste Geschichte mit
              Wyldo.
            </Text>
          </View>
        </View>
        <View style={styles.search}>
          <Icon name="search-outline" color={c.ink} />
          <TextInput
            accessibilityLabel="Quests suchen"
            placeholder="Dein Abenteuer suchen"
            placeholderTextColor="#687267"
            value={query}
            onChangeText={setQuery}
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 15,
              color: c.ink,
              minHeight: 48,
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filter anzeigen"
            onPress={() => setFilter(!filter)}
            style={{ padding: 12 }}
          >
            <Icon name="options-outline" color={c.ink} />
          </Pressable>
        </View>
        {filter && (
          <Panel>
            <Label>Standortfilter noch nicht verfügbar</Label>
            <Label muted>
              Ohne freigegebenes Live-GPS zeigen wir keine erfundenen
              Entfernungen.
            </Label>
            <Button label="Filter schließen" onPress={() => setFilter(false)} />
          </Panel>
        )}
        {draft && !query && (
          <>
            <View style={s.row}>
              <Icon name="sparkles-outline" color={c.gold} />
              <Title small>Ein Schatz wartet auf euch</Title>
            </View>
            <QuestCard quest={draft} />
            <Notice>
              Entwicklungsvorschau · Route und Rätsel sind noch nicht vor Ort
              geprüft. Nicht draußen spielbar.
            </Notice>
          </>
        )}
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <Title small>Neue Geschichten</Title>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Alle Testquests auf Karte anzeigen"
            onPress={() => router.push("/map")}
            style={{ minHeight: 48, justifyContent: "center" }}
          >
            <Icon name="map-outline" color={c.gold} />
          </Pressable>
        </View>
        <Label muted>
          {catalog.source === "fixture"
            ? "Lokaler Testkatalog · kein Produktionsfeed"
            : "Veröffentlichte Abenteuer"}
        </Label>
        {catalog.loading && <Notice>Quests werden geladen …</Notice>}
        {catalog.error && (
          <Panel>
            <Label>Quests konnten nicht geladen werden.</Label>
            <Button label="Erneut laden" onPress={catalog.retry} />
          </Panel>
        )}
        {quests.map((q) => (
          <QuestCard key={q.id} quest={q} />
        ))}
        {!catalog.loading && !catalog.error && !quests.length && (
          <Panel>
            <Label>Keine Quest gefunden.</Label>
            <Button label="Suche zurücksetzen" onPress={() => setQuery("")} />
          </Panel>
        )}
        <Panel light>
          <View style={s.row}>
            <Icon name="leaf-outline" color={c.pine} />
            <Text style={[s.ink, { flex: 1 }]}>
              Das Abenteuer liegt draußen. Auf markierten Wegen bleiben und
              gemeinsam entdecken.
            </Text>
          </View>
        </Panel>
      </Screen>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  logo: {
    fontFamily: fonts.display,
    color: c.cream,
    fontWeight: "900",
    fontSize: 38,
  },
  profile: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: c.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    minHeight: 300,
    padding: 20,
    borderRadius: 26,
    backgroundColor: "#285C45",
    borderWidth: 1,
    borderColor: "#68815A",
    overflow: "hidden",
    justifyContent: "center",
  },
  sun: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "#D3B863",
    opacity: 0.2,
    right: -40,
    top: -30,
  },
  search: {
    backgroundColor: c.cream,
    borderRadius: 16,
    paddingLeft: 14,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
});

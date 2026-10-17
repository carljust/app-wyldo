import AdventureLandscape from "./AdventureLandscape";
import { router } from "expo-router";
import { Pressable, Text, View, StyleSheet } from "react-native";
import type { QuestSummary } from "../domain/quest";
import { Badge, Icon, s } from "./ui";
import { colors as c, fonts } from "../theme/tokens";
export default function QuestCard({ quest }: { quest: QuestSummary }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Quest entdecken: ${quest.title}`}
      onPress={() => router.push(`/quest/${quest.id}`)}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
    >
      {quest.status === "draft" && (
        <View
          style={{
            height: 132,
            borderRadius: 14,
            overflow: "hidden",
            marginBottom: 2,
          }}
        >
          <AdventureLandscape />
        </View>
      )}
      <View style={s.row}>
        <Badge>
          {quest.status === "draft"
            ? "UNVERÖFFENTLICHT · DEV"
            : quest.kind === "fixture"
              ? "FIKTIVE TESTQUEST"
              : "ABENTEUER"}
        </Badge>
        <View style={{ flex: 1 }} />
        <Icon
          name={
            quest.id === "externsteine" ? "sparkles-outline" : "leaf-outline"
          }
          color={c.gold}
        />
      </View>
      <Text style={styles.title}>{quest.title}</Text>
      <Text style={s.text}>{quest.subtitle}</Text>
      <View
        style={[s.row, { justifyContent: "space-between", paddingTop: 12 }]}
      >
        <Text style={{ color: c.muted, fontSize: 12 }}>
          {quest.status === "draft"
            ? "8 Kapitel  ·  4 Steinsiegel"
            : quest.kind === "fixture"
              ? "Nur zur Interaktionsprüfung"
              : "Veröffentlichtes Abenteuer"}
        </Text>
        <Icon name="arrow-forward-circle" size={36} color={c.gold} />
      </View>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderColor: c.gold,
    borderWidth: 1,
    padding: 20,
    gap: 12,
    backgroundColor: c.forest,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "700",
    color: c.cream,
  },
});

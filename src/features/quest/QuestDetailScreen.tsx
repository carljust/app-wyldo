import { useAuth } from "../auth/AuthProvider";
import { canUseLiveNavigation } from "../../domain/navigation/session";
import { useQuestDetail } from "../../data/useQuests";
import AdventureLandscape from "../../components/AdventureLandscape";
import { useMemo } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
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
import QuestMap from "../../components/QuestMap";
import { detailMap } from "../../domain/maps";
import { getVisibleQuest } from "../../data/quests";
import { colors as c } from "../../theme/tokens";
export default function Details() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ownerId = useAuth().session?.user.id ?? null;
  const { quest: q, loading, error } = useQuestDetail(id);
  const model = useMemo(() => (q ? detailMap(q) : { pins: [], line: [] }), [q]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.deep }}>
      <Screen>
        <Button
          label="Zurück zu Entdecken"
          secondary
          icon="arrow-back"
          onPress={() => router.replace("/")}
        />
        {!q ? (
          <Panel>
            <Title small>
              {loading
                ? "Quest wird geladen …"
                : error
                  ? "Quest konnte nicht geladen werden"
                  : "Quest nicht verfügbar"}
            </Title>
            <Label>Diese Vorschau ist nicht öffentlich freigegeben.</Label>
          </Panel>
        ) : (
          <>
            <Badge>
              {q.status === "draft"
                ? "UNVERÖFFENTLICHT · DEV-VORSCHAU"
                : q.kind === "fixture"
                  ? "FIKTIVE TESTQUEST"
                  : "VERÖFFENTLICHTE QUEST"}
            </Badge>
            <View
              style={{
                alignItems: "center",
                backgroundColor: c.forest,
                borderRadius: 24,
                padding: 12,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  opacity: 0.65,
                }}
              >
                <AdventureLandscape />
              </View>
              <Fox size={180} />
              <Text style={[s.eyebrow, { marginBottom: 10 }]}>
                VIER SIEGEL. EINE GROSSE GESCHICHTE.
              </Text>
            </View>
            <Title>{q.title}</Title>
            <Label>{q.subtitle}</Label>
            <Panel light>
              <Text style={[s.ink, { fontSize: 21, fontWeight: "700" }]}>
                Über diese Quest
              </Text>
              <Text style={s.ink}>{q.description}</Text>
            </Panel>
            {q.chapters > 0 && (
              <View style={[s.row, { alignItems: "stretch" }]}>
                <Panel style={{ flex: 1, padding: 14 }}>
                  <Icon name="book-outline" color={c.gold} />
                  <Title small>{q.chapters} Kapitel</Title>
                  <Label muted>Gemeinsam entdecken</Label>
                </Panel>
                <Panel style={{ flex: 1, padding: 14 }}>
                  <Icon name="sparkles-outline" color={c.gold} />
                  <Title small>{q.seals} Siegel</Title>
                  <Label muted>Ein virtueller Schatz</Label>
                </Panel>
              </View>
            )}
            <Title small>Deine Route ins Abenteuer</Title>
            {q.route ? (
              <>
                <Notice>
                  {q.route.approval === "draft"
                    ? "Routenentwurf – noch nicht vor Ort geprüft"
                    : "Geprüfter Routenverlauf"}
                </Notice>
                <QuestMap model={model} />
                <Label muted>
                  {q.route.approval === "draft"
                    ? "OH! 6 · Nutzer-GPX · 218 Trackpunkte · ca. 2,55 km Tracklänge. Start/Ziel ist ein ungeprüfter Kandidat."
                    : `${q.route.geometry.coordinates.length} Trackpunkte · Route ${q.route.routeVersion}`}
                </Label>
              </>
            ) : (
              <Panel>
                <Icon name="map-outline" color={c.gold} />
                <Label>Route wird noch geprüft</Label>
                <Label muted>Für diese Testquest liegt keine Route vor.</Label>
              </Panel>
            )}
            <Panel>
              <Label>
                Alter{" "}
                {q.recommendedAge
                  ? `ab ${q.recommendedAge} Jahren (Entwurf)`
                  : "noch offen"}{" "}
                · Schwierigkeit und Gehzeit noch nicht freigegeben.
              </Label>
              <Label muted>
                Entfernung zum Start ohne Live-Standort nicht verfügbar. XP und
                Belohnungen sind in dieser Phase deaktiviert.
              </Label>
            </Panel>
            <Notice>
              Auf markierten Wegen bleiben. Keine Rätselstationen freigegeben.
              Diese Vorschau erlaubt keinen Outdoor-Queststart.
            </Notice>
            {q && canUseLiveNavigation(q, ownerId) && (
              <Button
                label="Zum Startpunkt navigieren"
                onPress={() => router.push(`/navigate/${q.id}?mode=live`)}
              />
            )}
            {__DEV__ && (
              <Button
                label="Zum Startpunkt · Simulation"
                icon="navigate-outline"
                onPress={() => router.push(`/navigate/${q.id}`)}
              />
            )}
            <Button label="Quest beginnen · noch nicht freigegeben" disabled />
          </>
        )}
      </Screen>
    </SafeAreaView>
  );
}

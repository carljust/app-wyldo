import { useQuestCatalog } from "../../data/useQuests";
import { useCallback, useMemo, useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Badge,
  Button,
  Label,
  Notice,
  Panel,
  Screen,
  Title,
} from "../../components/ui";
import QuestMap from "../../components/QuestMap";
import { globalMap } from "../../domain/maps";
import { questRepository } from "../../data/quests";
import { colors as c } from "../../theme/tokens";
export default function MapScreen() {
  const catalog = useQuestCatalog();
  const quests = catalog.quests;
  const model = useMemo(() => globalMap(quests), [quests]);
  const [selected, setSelected] = useState<string | null>(null);
  const select = useCallback((id: string) => setSelected(id), []);
  const q = quests.find((x) => x.id === selected);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.deep }} edges={["top"]}>
      <Screen>
        <Badge>
          {catalog.source === "fixture" ? "LOKALER TESTKATALOG" : "QUEST-KARTE"}
        </Badge>
        <Title>Finde dein Abenteuer</Title>
        <Label muted>Ein Startpunkt. Eine neue Geschichte.</Label>
        {catalog.loading && <Notice>Quests werden geladen …</Notice>}
        {catalog.error && (
          <Panel>
            <Label>Questdaten konnten nicht geladen werden.</Label>
            <Button label="Erneut laden" onPress={catalog.retry} />
          </Panel>
        )}
        <QuestMap model={model} onSelect={select} global />
        {q ? (
          <Panel>
            <Badge>
              {q.kind === "fixture" ? "FIKTIVE TESTQUEST" : "ABENTEUER"}
            </Badge>
            <Title small>{q.title}</Title>
            <Label>{q.subtitle}</Label>
            <Label muted>
              Alter, Schwierigkeit und Gehzeit noch nicht freigegeben.
              Entfernung ohne Live-Standort nicht verfügbar.
            </Label>
            <Button
              label="Quest entdecken"
              onPress={() => router.push(`/quest/${q.id}`)}
            />
            <Button
              label="Vorschau schließen"
              secondary
              onPress={() => setSelected(null)}
            />
          </Panel>
        ) : (
          <Panel>
            <Label>Tippe auf einen goldenen Startpin.</Label>
            <Label muted>
              Keine Kapitel oder geheimen Stationen werden angezeigt.
            </Label>
          </Panel>
        )}
        <Notice>
          Live-Standort in dieser Phase deaktiviert. Die Karte bleibt ohne
          Standortberechtigung nutzbar. Online-Kacheln benötigen Internet.
        </Notice>
        <View style={{ gap: 8 }}>
          {quests.map((x) => (
            <Button
              key={x.id}
              label={`Vorschau: ${x.title}`}
              secondary
              onPress={() => select(x.id)}
            />
          ))}
        </View>
      </Screen>
    </SafeAreaView>
  );
}

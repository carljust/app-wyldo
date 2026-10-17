import { useQuestDetail } from "../../data/useQuests";
import { useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View, StyleSheet } from "react-native";
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
import QuestMap from "../../components/QuestMap";
import { navigationModel } from "../../domain/maps";
import { getVisibleQuest } from "../../data/quests";
import { colors as c, fonts } from "../../theme/tokens";
export default function Navigation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { quest: q } = useQuestDetail(id);
  const [mode, setMode] = useState<"map" | "direction">("direction");
  const [paused, setPaused] = useState(false);
  const [heading, setHeading] = useState(0);
  const [available, setAvailable] = useState(true);
  // Fixed, clearly labelled development input; never requests or impersonates live GPS.
  const origin = useMemo(
    () =>
      q
        ? {
            latitude: q.startPoint.latitude + 0.003,
            longitude: q.startPoint.longitude - 0.002,
          }
        : null,
    [q],
  );
  const nav =
    q && origin ? navigationModel(origin, q.startPoint, heading) : null;
  const map = useMemo(
    () => ({
      line: [],
      pins:
        q && origin
          ? [
              { id: "origin", point: origin, label: "Simulierter Standort" },
              {
                id: "target",
                point: q.startPoint,
                label: "Startpunkt · Kandidat",
              },
            ]
          : [],
    }),
    [q, origin],
  );
  if (!__DEV__ || !q || !nav)
    return (
      <Screen>
        <Title>Navigation nicht freigegeben</Title>
        <Button label="Zurück" onPress={() => router.replace("/")} />
      </Screen>
    );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.deep }}>
      <Screen>
        <Button
          label="Zurück zur Quest"
          icon="arrow-back"
          secondary
          onPress={() => router.replace(`/quest/${id}`)}
        />
        <Badge>ENTWICKLUNGSMODUS · GPS-SIMULATION</Badge>
        <Title small>{q.title}</Title>
        <Label muted>1 · Startpunkt ansehen / Queststart gesperrt</Label>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Button
              label="Karte"
              secondary={mode === "map"}
              icon="map-outline"
              onPress={() => setMode("map")}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="Richtung"
              secondary={mode === "direction"}
              icon="navigate-outline"
              onPress={() => setMode("direction")}
            />
          </View>
        </View>
        {paused ? (
          <Panel>
            <Title small>Navigation pausiert</Title>
            <Label>
              Simulation angehalten. Keine Quest gestartet und kein Fortschritt
              gespeichert.
            </Label>
            <Button
              label="Simulation fortsetzen"
              onPress={() => setPaused(false)}
            />
          </Panel>
        ) : !available ? (
          <Panel>
            <Title small>Standort nicht verfügbar</Title>
            <Label>
              Ohne Standort ist keine Peilung möglich. Live-GPS ist in dieser
              Phase deaktiviert.
            </Label>
            <Button
              label="Simulierten Standort wiederherstellen"
              onPress={() => setAvailable(true)}
            />
          </Panel>
        ) : mode === "map" ? (
          <>
            <QuestMap model={map} />
            <Notice>
              Nur Start und simulierter Standort. Kein geprüfter Anreiseweg
              vorhanden.
            </Notice>
          </>
        ) : (
          <View style={styles.direction}>
            <View style={styles.compass}>
              <Text style={styles.north}>N</Text>
              <Text style={styles.west}>W</Text>
              <Text style={styles.east}>O</Text>
              <Text style={styles.south}>S</Text>
              <View style={{ transform: [{ rotate: `${nav.rotation}deg` }] }}>
                <Icon name="navigate" size={112} color={c.gold} />
              </View>
            </View>
            <Text style={styles.distance}>{Math.round(nav.distanceM)} m</Text>
            <Text style={styles.air}>Luftlinie zum Startpunkt</Text>
            <Label muted>
              Simulierte Peilung · {Math.round(nav.rotation)}°
            </Label>
          </View>
        )}
        <Notice>
          Auf markierten Wegen bleiben. Der Pfeil zeigt Luftlinie und keinen
          begehbaren Weg.
        </Notice>
        <Panel>
          <Label>GPS und Kompass: simuliert</Label>
          <Label muted>
            Keine Geräteortung, kein Live-Heading, keine Ankunftserkennung. Ein
            ungeprüfter Startpunkt wird niemals automatisch freigeschaltet.
          </Label>
          {!paused && (
            <>
              <Button
                label="Gerätedrehung simulieren (+45°)"
                secondary
                onPress={() => setHeading((heading + 45) % 360)}
              />
              <Button
                label={
                  available
                    ? "Fehlenden Standort simulieren"
                    : "Standortsimulation aktivieren"
                }
                secondary
                onPress={() => setAvailable(!available)}
              />
            </>
          )}
        </Panel>
        {!paused && (
          <Button
            label="Navigation pausieren"
            icon="pause-outline"
            onPress={() => setPaused(true)}
          />
        )}
        <Button label="Quest starten · nicht freigegeben" disabled />
      </Screen>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  direction: { alignItems: "center", paddingVertical: 12, gap: 8 },
  compass: {
    width: 244,
    height: 244,
    borderRadius: 122,
    borderWidth: 2,
    borderColor: c.gold,
    backgroundColor: c.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  north: { position: "absolute", top: 10, color: c.gold, fontWeight: "700" },
  south: { position: "absolute", bottom: 10, color: c.muted },
  west: { position: "absolute", left: 12, color: c.muted },
  east: { position: "absolute", right: 12, color: c.muted },
  distance: {
    fontFamily: fonts.display,
    fontSize: 56,
    fontWeight: "700",
    color: c.gold,
  },
  air: { fontSize: 18, color: c.cream, fontWeight: "700" },
});

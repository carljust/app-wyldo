import { useQuestDetail } from "../../data/useQuests";
import { useCallback, useEffect, useMemo, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
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
import { canUseLiveNavigation } from "../../domain/navigation/session";
import { useAuth } from "../auth/AuthProvider";
import { useNavigationSession } from "../session/useNavigationSession";
import { useLiveLocation } from "../session/useLiveLocation";
import { SessionPanels } from "../session/SessionPanels";
import { colors as c, fonts } from "../../theme/tokens";
import { StyleSheet } from "react-native";
export default function Navigation() {
  const { id, mode: requestedMode } = useLocalSearchParams<{
    id: string;
    mode?: string;
  }>();
  const mode = requestedMode === "live" ? "live" : "simulation";
  const ownerId = useAuth().session?.user.id ?? null;
  const { quest: freshQuest } = useQuestDetail(id);
  const { state, loading, busy, error, sync, dispatch, synchronize } =
    useNavigationSession(id, freshQuest, mode, ownerId);
  const q = state?.quest ?? freshQuest;
  const [view, setView] = useState<"map" | "direction">("direction");
  const [tracking, setTracking] = useState(false);
  const stopTracking = useCallback(() => setTracking(false), []);
  useFocusEffect(useCallback(() => () => stopTracking(), [stopTracking]));
  const liveAllowed =
    !!freshQuest &&
    canUseLiveNavigation(freshQuest, ownerId) &&
    freshQuest.questVersionId === state?.questVersion;
  useEffect(() => {
    if (!liveAllowed || state?.paused) stopTracking();
  }, [liveAllowed, state?.paused, stopTracking]);
  const locationStatus = useLiveLocation(
    tracking &&
      liveAllowed &&
      !state?.paused &&
      [
        "navigating_to_start",
        "ready_at_start",
        "navigating_to_station",
      ].includes(state?.phase ?? ""),
    freshQuest,
    ownerId,
    dispatch,
    stopTracking,
  );
  const nav =
    state?.fix && state.target
      ? navigationModel(state.fix.point, state.target.point, state.heading ?? 0)
      : null;
  const map = useMemo(
    () => ({
      line: [],
      pins: state?.target
        ? [
            ...(state.fix
              ? [
                  {
                    id: "origin",
                    point: state.fix.point,
                    label:
                      mode === "simulation"
                        ? "Simulierter Standort"
                        : "Letzte Standortmessung",
                  },
                ]
              : []),
            {
              id: "target",
              point: state.target.point,
              label:
                state.target.fieldApproval === "draft"
                  ? "Startpunkt · Kandidat"
                  : "Aktuelles freigegebenes Ziel",
            },
          ]
        : [],
    }),
    [state?.fix, state?.target, mode],
  );
  async function simulateArrival() {
    const now = Date.now();
    await dispatch({ type: "POSITION_UNAVAILABLE", now });
    for (const offset of [6000, 3000, 0])
      await dispatch({
        type: "FIX",
        fix: { point: q!.startPoint, accuracyM: 5, timestamp: now - offset },
        now,
      });
  }
  const blocked = mode === "simulation" && !__DEV__;
  if (blocked)
    return (
      <Screen>
        <Title>Navigation nicht freigegeben</Title>
        <Button label="Zurück" onPress={() => router.replace("/")} />
      </Screen>
    );
  if (loading)
    return (
      <Screen>
        <Title small>Spielstand wird geladen …</Title>
        <Label>Lokale Daten werden geprüft.</Label>
      </Screen>
    );
  if (!state || !q)
    return (
      <Screen>
        <Title small>Navigation nicht verfügbar</Title>
        <Notice>
          {error ??
            "Questdaten fehlen. Bitte zuerst die Detailseite online öffnen."}
        </Notice>
        <Button label="Zurück" onPress={() => router.replace("/")} />
      </Screen>
    );
  const inNavigation = [
    "navigating_to_start",
    "ready_at_start",
    "navigating_to_station",
  ].includes(state.phase);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.deep }}>
      <Screen>
        <Button
          label="Zurück zur Quest"
          icon="arrow-back"
          secondary
          onPress={() => router.replace(`/quest/${id}`)}
        />
        <Badge>
          {mode === "simulation"
            ? "ENTWICKLUNGSMODUS · GPS-SIMULATION"
            : "NAVIGATION · FREIGEGEBENES ZIEL"}
        </Badge>
        <Title small>{q.title}</Title>
        <Label muted>
          Spielstand gespeichert · Stand {state.revision} ·{" "}
          {busy ? "Speichert …" : "Auf diesem Gerät"}
        </Label>
        {error && <Notice>{error}</Notice>}
        <SessionPanels state={state} busy={busy} dispatch={dispatch} />
        {!state.paused && inNavigation && (
          <>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Button
                  label="Karte"
                  secondary={view === "map"}
                  icon="map-outline"
                  onPress={() => setView("map")}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  label="Richtung"
                  secondary={view === "direction"}
                  icon="navigate-outline"
                  onPress={() => setView("direction")}
                />
              </View>
            </View>
            {state.gpsStatus === "unavailable" ? (
              <Panel>
                <Title small>Standort nicht verfügbar</Title>
                <Label>
                  {mode === "simulation"
                    ? "Ohne simulierten Standort ist keine Peilung möglich."
                    : "Ortung explizit aktivieren. Ohne Messung ist keine Peilung möglich."}
                </Label>
                {mode === "simulation" && (
                  <Button
                    label="Simulierten Standort wiederherstellen"
                    disabled={busy}
                    onPress={() =>
                      void dispatch({
                        type: "FIX",
                        fix: {
                          point: {
                            latitude: q.startPoint.latitude + 0.003,
                            longitude: q.startPoint.longitude - 0.002,
                          },
                          accuracyM: 5,
                          timestamp: Date.now(),
                        },
                        now: Date.now(),
                      })
                    }
                  />
                )}
              </Panel>
            ) : view === "map" ? (
              <>
                <QuestMap model={map} />
                <Notice>
                  Nur aktuelles Ziel und letzter Standort. Keine geheimen
                  Folgeziele. Online-Kacheln benötigen Internet.
                </Notice>
              </>
            ) : (
              nav && (
                <View style={styles.direction}>
                  <View style={styles.compass}>
                    <Text style={styles.north}>N</Text>
                    <Text style={styles.west}>W</Text>
                    <Text style={styles.east}>O</Text>
                    <Text style={styles.south}>S</Text>
                    <View
                      style={{ transform: [{ rotate: `${nav.rotation}deg` }] }}
                    >
                      <Icon
                        name="navigate"
                        size={112}
                        color={state.heading === null ? c.muted : c.gold}
                      />
                    </View>
                  </View>
                  <Text style={styles.distance}>
                    {Math.round(nav.distanceM)} m
                  </Text>
                  <Text style={styles.air}>
                    {state.target?.kind === "start"
                      ? "Luftlinie zum Startpunkt"
                      : "Luftlinie zum aktuellen Ziel"}
                  </Text>
                  <Label muted>
                    {state.heading === null
                      ? "Kompassausrichtung fehlt · Pfeil nordbezogen, Karte nutzen"
                      : `${mode === "simulation" ? "Simulierte Peilung" : "Peilung"} · ${Math.round(nav.rotation)}°`}
                  </Label>
                </View>
              )
            )}
            {state.gpsStatus === "inaccurate" && (
              <Notice>GPS zu ungenau. Keine Ankunftsfreigabe.</Notice>
            )}
            {state.gpsStatus === "stale" && (
              <Notice>
                Standortmessung ist veraltet. Keine Ankunftsfreigabe.
              </Notice>
            )}
          </>
        )}
        <Notice>
          Auf markierten Wegen bleiben. Der Pfeil zeigt Luftlinie und keinen
          begehbaren Weg.
        </Notice>
        {mode === "simulation" ? (
          <Panel>
            <Label>GPS und Kompass: simuliert</Label>
            <Label muted>
              Kein Live-GPS, keine echten Ankünfte. Drei genaue Testmessungen
              über sechs simulierte Sekunden bestätigen nur den lokalen
              Entwicklungszustand.
            </Label>
            {!state.paused && inNavigation && (
              <>
                <Button
                  label="Gerätedrehung simulieren (+45°)"
                  secondary
                  disabled={busy}
                  onPress={() =>
                    void dispatch({
                      type: "HEADING",
                      heading: ((state.heading ?? 0) + 45) % 360,
                      now: Date.now(),
                    })
                  }
                />
                <Button
                  label="Fehlenden Standort simulieren"
                  secondary
                  disabled={busy}
                  onPress={() =>
                    void dispatch({
                      type: "POSITION_UNAVAILABLE",
                      now: Date.now(),
                    })
                  }
                />
                {state.phase === "navigating_to_start" && (
                  <Button
                    label="Startbereich · 3 Messungen simulieren"
                    disabled={busy}
                    onPress={() => void simulateArrival()}
                  />
                )}
              </>
            )}
          </Panel>
        ) : (
          <Panel>
            <Label>
              GPS:{" "}
              {locationStatus === "active"
                ? "aktiv"
                : locationStatus === "denied"
                  ? "Berechtigung verweigert"
                  : locationStatus === "requesting"
                    ? "Berechtigung wird angefragt"
                    : locationStatus === "unavailable"
                      ? "nicht verfügbar"
                      : "aus"}
            </Label>
            <Label muted>
              Nur während dieser Ansicht im Vordergrund. Nach Pause oder
              Appwechsel bewusst erneut aktivieren.
            </Label>
            <Button
              label={tracking ? "Ortung beenden" : "Ortung aktivieren"}
              disabled={!liveAllowed || busy || state.paused || !inNavigation}
              onPress={() => setTracking(!tracking)}
            />
            {!liveAllowed && (
              <Notice>
                Aktuelle Online-Freigabe und passende Questversion erforderlich.
                Keine Ortungsberechtigung wird angefragt.
              </Notice>
            )}
          </Panel>
        )}
        {!state.paused && (
          <Button
            label="Navigation pausieren"
            icon="pause-outline"
            disabled={busy}
            onPress={() => {
              stopTracking();
              void dispatch({ type: "PAUSE", now: Date.now() });
            }}
          />
        )}
        <Panel>
          <Label>
            {mode === "simulation"
              ? "Nur lokal · Simulation wird nicht hochgeladen"
              : sync.pending
                ? `${sync.pending} Änderungen warten auf Synchronisierung`
                : "Keine ausstehenden Änderungen"}
          </Label>
          {mode === "live" && (
            <Button
              label="Synchronisieren"
              disabled={busy}
              secondary
              onPress={() => void synchronize()}
            />
          )}
          <Label muted>
            Keine XP oder Belohnungen. Offline-Fortschritt und öffentliche
            Questdaten bleiben auf diesem Gerät verfügbar.
          </Label>
        </Panel>
        <Button label="Quest-Aufgaben · folgen in Phase 5" disabled />
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

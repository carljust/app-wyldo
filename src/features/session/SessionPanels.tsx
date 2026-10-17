import { View, Text } from "react-native";
import {
  Button,
  Fox,
  Label,
  Notice,
  Panel,
  Title,
  s,
} from "../../components/ui";
import type {
  NavigationSession,
  Command,
} from "../../domain/navigation/session";
export function SessionPanels({
  state,
  busy,
  dispatch,
}: {
  state: NavigationSession;
  busy: boolean;
  dispatch: (command: Command) => Promise<boolean>;
}) {
  if (state.paused)
    return (
      <Panel>
        <Title small>Navigation pausiert</Title>
        <Label>Dein Spielstand ist auf diesem Gerät gespeichert.</Label>
        <Button
          label={
            state.mode === "simulation"
              ? "Simulation fortsetzen"
              : "Navigation fortsetzen"
          }
          disabled={busy}
          onPress={() => void dispatch({ type: "RESUME", now: Date.now() })}
        />
      </Panel>
    );
  if (state.phase === "ready_at_start")
    return (
      <Panel light>
        <View style={{ alignItems: "center" }}>
          <Fox size={140} />
        </View>
        <Text style={[s.ink, { fontSize: 22, fontWeight: "700" }]}>
          {state.mode === "simulation"
            ? "Simulierter Startbereich erreicht"
            : "Startbereich erreicht"}
        </Text>
        <Text style={s.ink}>
          Wyldo wartet auf euch. Du entscheidest bewusst, wann die Geschichte
          beginnt.
        </Text>
        <Button
          label={
            state.mode === "simulation"
              ? "Simulation bewusst starten"
              : "Quest bewusst beginnen"
          }
          disabled={busy}
          onPress={() =>
            void dispatch({ type: "START_QUEST", now: Date.now() })
          }
        />
      </Panel>
    );
  if (state.phase === "intro")
    return (
      <Panel light>
        <View style={{ alignItems: "center" }}>
          <Fox size={160} />
        </View>
        <Text style={[s.ink, { fontSize: 22, fontWeight: "700" }]}>
          {state.quest.id === "externsteine"
            ? "Die geheimnisvolle Schatzkarte"
            : state.quest.title}
        </Text>
        <Text style={s.ink}>
          {state.quest.id === "externsteine"
            ? "„Psst! Schau mal, was ich gefunden habe: eine uralte Schatzkarte! Vier Steinsiegel sollen uns zum Schatz der Externsteine führen. Hilfst du mir?“"
            : state.quest.description}
        </Text>
        <Text style={s.ink}>
          Statische Storyvorschau · noch keine Animation oder Audioaufnahme.
        </Text>
        <Button
          label="Intro beenden"
          disabled={busy}
          onPress={() =>
            void dispatch({ type: "FINISH_INTRO", now: Date.now() })
          }
        />
      </Panel>
    );
  if (state.phase === "awaiting_target" || state.phase === "station_event")
    return (
      <Panel>
        <Title small>
          {state.phase === "awaiting_target"
            ? "Nächste Station noch nicht freigegeben"
            : "Zielbereich erreicht"}
        </Title>
        <Label>
          Der Spielstand bleibt gespeichert. Beobachtungsaufgaben und die acht
          Storykapitel folgen in Phase 5.
        </Label>
        <Notice>
          Keine ungeprüften Rätselpositionen, Antworten oder Belohnungen werden
          freigeschaltet.
        </Notice>
      </Panel>
    );
  return null;
}

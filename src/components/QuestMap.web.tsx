import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import type * as Leaflet from "leaflet";
import { clusterPins } from "../domain/maps";
import type { QuestMapProps } from "./QuestMap.types";
import { colors as c } from "../theme/tokens";
import "leaflet/dist/leaflet.css";
export default function QuestMap({
  model,
  onSelect,
  global = false,
}: QuestMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState("Karte wird geladen …");
  useEffect(() => {
    let disposed = false;
    let map: Leaflet.Map | undefined;
    let resize: ResizeObserver | undefined;
    import("leaflet")
      .then((L) => {
        if (disposed || !ref.current) return;
        map = L.map(ref.current, {
          scrollWheelZoom: false,
          zoomControl: true,
          attributionControl: true,
        });
        const m = map;
        let failed = false;
        const tiles = L.tileLayer(
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 19,
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        ).addTo(m);
        tiles.on("load", () => {
          if (!failed) setState("");
        });
        tiles.on("tileerror", () => {
          failed = true;
          setState(
            "Kartenkacheln fehlen · Internetverbindung prüfen. Track und Pins bleiben sichtbar.",
          );
        });
        const points = model.line.length
          ? model.line
          : model.pins.map((p) => p.point);
        const bounds = L.latLngBounds(
          points.map((p) => [p.latitude, p.longitude]),
        );
        if (points.length > 1)
          m.fitBounds(bounds, { padding: [35, 40], maxZoom: 15 });
        else
          m.setView(
            points.length
              ? [points[0].latitude, points[0].longitude]
              : [51.879, 8.919],
            13,
          );
        if (model.line.length)
          L.polyline(
            model.line.map(
              (p) => [p.latitude, p.longitude] as [number, number],
            ),
            { color: "#E0A638", weight: 5, opacity: 1, smoothFactor: 0 },
          ).addTo(m);
        const markers = L.layerGroup().addTo(m);
        function render() {
          markers.clearLayers();
          const pins = global
            ? clusterPins(model.pins, (p) =>
                m.latLngToContainerPoint([p.latitude, p.longitude]),
              )
            : model.pins;
          for (const p of pins) {
            const count = p.questIds?.length ?? 1;
            const marker = L.marker([p.point.latitude, p.point.longitude], {
              title: p.label,
              keyboard: true,
              icon: L.divIcon({
                className: "wyldo-marker",
                html: `<div style="width:44px;height:44px;background:#183D32;border:3px solid #E4B85C;border-radius:50% 50% 50% 8%;display:flex;align-items:center;justify-content:center;color:#F7F0DE;font:bold 18px system-ui;box-shadow:0 3px 8px #0005">${count > 1 ? count : "✦"}</div>`,
                iconSize: [48, 48],
                iconAnchor: [24, 48],
              }),
            }).addTo(markers);
            marker.on("click", () => {
              if (count > 1) {
                m.fitBounds(
                  L.latLngBounds(
                    model.pins
                      .filter((x) => p.questIds?.includes(x.id))
                      .map((x) => [x.point.latitude, x.point.longitude]),
                  ),
                  { padding: [40, 40], maxZoom: m.getZoom() + 2 },
                );
              } else onSelect?.(p.id);
            });
          }
        }
        render();
        m.on("zoomend", render);
        resize = new ResizeObserver(() => m.invalidateSize());
        resize.observe(ref.current);
      })
      .catch(() =>
        setState("Karte konnte nicht geladen werden. Bitte erneut öffnen."),
      );
    return () => {
      disposed = true;
      resize?.disconnect();
      map?.remove();
    };
  }, [model, onSelect, global]);
  return (
    <View testID="real-map" style={styles.wrap}>
      <div
        ref={ref}
        aria-label={global ? "Quest-Übersichtskarte" : "Quest-Routenkarte"}
        style={{ height: "100%", width: "100%", position: "absolute" }}
      />
      {state ? (
        <View pointerEvents="none" style={styles.status}>
          <Text style={styles.text}>{state}</Text>
        </View>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    height: 320,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#dbe5d3",
    position: "relative",
  },
  status: {
    position: "absolute",
    top: 8,
    left: 52,
    right: 8,
    backgroundColor: c.deep,
    padding: 8,
    borderRadius: 8,
    zIndex: 1000,
  },
  text: { color: c.cream, fontSize: 11 },
});

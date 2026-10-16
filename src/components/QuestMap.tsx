import React, { useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";
import { clusterPins } from "../domain/maps";
import type { QuestMapProps } from "./QuestMap.types";
import { colors as c } from "../theme/tokens";
export default function QuestMap({
  model,
  onSelect,
  global = false,
}: QuestMapProps) {
  const ref = useRef<MapView>(null);
  const [zoom, setZoom] = useState(13);
  const [width, setWidth] = useState(360);
  const all = model.line.length ? model.line : model.pins.map((p) => p.point);
  const pins = global
    ? clusterPins(model.pins, (p) => ({
        x: (p.longitude * width) / (360 / 2 ** zoom),
        y:
          (Math.log(Math.tan(Math.PI / 4 + (p.latitude * Math.PI) / 360)) *
            width) /
          ((2 * Math.PI) / 2 ** zoom),
      }))
    : model.pins;
  return (
    <View
      style={styles.wrap}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      <MapView
        ref={ref}
        style={StyleSheet.absoluteFill}
        mapType="none"
        initialRegion={{
          latitude: 51.879,
          longitude: 8.919,
          latitudeDelta: 0.05,
          longitudeDelta: 0.065,
        }}
        onMapReady={() =>
          all.length > 1 &&
          ref.current?.fitToCoordinates(all, {
            edgePadding: { top: 45, bottom: 45, left: 40, right: 40 },
            animated: false,
          })
        }
        onRegionChangeComplete={(r) =>
          setZoom(Math.log2(360 / r.longitudeDelta))
        }
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          tileSize={256}
        />
        {model.line.length > 0 && (
          <Polyline
            coordinates={model.line}
            strokeColor={c.gold}
            strokeWidth={5}
          />
        )}
        {pins.map((p) => (
          <Marker
            key={p.id}
            coordinate={p.point}
            title={p.label}
            onPress={() => {
              if ((p.questIds?.length ?? 1) > 1)
                ref.current?.animateCamera({ center: p.point, zoom: zoom + 2 });
              else onSelect?.(p.id);
            }}
          >
            <View style={styles.pin}>
              <Text style={styles.text}>
                {(p.questIds?.length ?? 1) > 1 ? p.questIds?.length : "✦"}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>
      <Text style={styles.credit}>
        © OpenStreetMap contributors · Onlinekarte
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: {
    height: 320,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#dbe5d3",
  },
  pin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: c.gold,
    backgroundColor: c.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: c.cream, fontSize: 19 },
  credit: {
    position: "absolute",
    bottom: 0,
    right: 0,
    fontSize: 10,
    backgroundColor: c.cream,
    color: c.ink,
    padding: 3,
  },
});

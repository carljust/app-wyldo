import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors as c, fonts } from "../theme/tokens";
export function Icon({
  name,
  size = 22,
  color = c.cream,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}
export function Label({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return <Text style={[s.text, muted && { color: c.muted }]}>{children}</Text>;
}
export function Title({
  children,
  small = false,
}: {
  children: React.ReactNode;
  small?: boolean;
}) {
  return <Text style={[s.title, small && { fontSize: 24 }]}>{children}</Text>;
}
export function Badge({ children }: { children: React.ReactNode }) {
  return <Text style={s.badge}>{children}</Text>;
}
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  icon,
}: {
  label: string;
  onPress?: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        disabled && { opacity: 0.5 },
        pressed && { opacity: 0.75 },
      ]}
    >
      {icon && <Icon name={icon} color={secondary ? c.ink : c.cream} />}
      <Text style={[s.buttonText, secondary && { color: c.ink }]}>{label}</Text>
    </Pressable>
  );
}
export function Panel({
  children,
  light = false,
  style,
}: {
  children: React.ReactNode;
  light?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View style={[s.panel, light && { backgroundColor: c.cream }, style]}>
      {children}
    </View>
  );
}
export function Screen({
  children,
  scroll = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  return scroll ? (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      {children}
    </ScrollView>
  ) : (
    <View style={[s.screen, s.content, { flex: 1 }]}>{children}</View>
  );
}
export function Fox({ size = 170 }: { size?: number }) {
  return (
    <View
      accessibilityLabel="Original Wyldo mit grünem Schal und Kompass"
      style={{ width: size * 0.8, height: size, overflow: "hidden" }}
    >
      <Image
        source={require("../../assets/wyldo-original.png")}
        resizeMode="stretch"
        style={{
          position: "absolute",
          width: size * 3.2,
          height: size,
          left: -size * 0.8,
        }}
      />
    </View>
  );
}
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.notice}>
      <Icon name="information-circle-outline" size={18} color={c.gold} />
      <Text style={s.noticeText}>{children}</Text>
    </View>
  );
}
export const s = StyleSheet.create({
  screen: { backgroundColor: c.deep },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 28,
    width: "100%",
    maxWidth: 740,
    alignSelf: "center",
  },
  text: {
    color: c.cream,
    fontSize: 15,
    lineHeight: 23,
    fontFamily: fonts.body,
  },
  title: {
    color: c.cream,
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 37,
    fontWeight: "700",
    flexShrink: 1,
  },
  badge: {
    color: c.ink,
    backgroundColor: c.gold,
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 30,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  button: {
    minHeight: 52,
    borderRadius: 16,
    padding: 14,
    backgroundColor: c.pine,
    borderWidth: 1,
    borderColor: c.gold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  secondary: { backgroundColor: c.cream },
  buttonText: {
    color: c.cream,
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "center",
  },
  panel: {
    backgroundColor: c.forest,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: c.border,
    padding: 18,
    gap: 12,
  },
  notice: {
    padding: 12,
    backgroundColor: "#20392E",
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: c.gold,
    flexDirection: "row",
    gap: 8,
  },
  noticeText: { color: c.cream, fontSize: 12, lineHeight: 18, flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  ink: { color: c.ink, fontSize: 15, lineHeight: 23 },
  eyebrow: { color: c.gold, fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  rule: { height: 1, backgroundColor: c.border },
});

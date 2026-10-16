import { Tabs } from "expo-router";
import { Icon } from "../../src/components/ui";
import { colors as c } from "../../src/theme/tokens";
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.gold,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: {
          backgroundColor: c.deep,
          borderTopColor: c.border,
          height: 76,
          paddingTop: 10,
          paddingBottom: 14,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Entdecken",
          tabBarIcon: ({ color }) => (
            <Icon
              name="compass-outline"
              color={typeof color === "string" ? color : c.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Karte",
          tabBarIcon: ({ color }) => (
            <Icon
              name="map-outline"
              color={typeof color === "string" ? color : c.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="backpack"
        options={{
          title: "Rucksack",
          tabBarIcon: ({ color }) => (
            <Icon
              name="bag-handle-outline"
              color={typeof color === "string" ? color : c.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <Icon
              name="person-outline"
              color={typeof color === "string" ? color : c.muted}
            />
          ),
        }}
      />
    </Tabs>
  );
}

import { Platform } from "react-native";
export const colors = {
  forest: "#183D32",
  deep: "#0D261F",
  pine: "#28614B",
  gold: "#E4B85C",
  cream: "#F7F0DE",
  ink: "#24342B",
  sky: "#B6DCE6",
  success: "#55A56A",
  muted: "#BFCDBB",
  border: "#49634C",
};
export const fonts = {
  display: Platform.select({
    ios: "Georgia",
    android: "serif",
    web: "Georgia, serif",
  }),
  body: Platform.select({
    ios: "System",
    android: "sans-serif",
    web: "system-ui, sans-serif",
  }),
};
export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { card: 22, button: 16, pill: 99 };

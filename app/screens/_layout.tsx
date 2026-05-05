import { Stack } from "expo-router";
import { colors } from "../../constants/theme";
import GroupSetupScreen from "./groupSetup";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="GroupSetupScreen" />
      <Stack.Screen name="new-bill" />
      <Stack.Screen name="scan-preview" />
      <Stack.Screen name="assignment" />
      <Stack.Screen name="split-summary" />
      <Stack.Screen name="history" />
      <Stack.Screen name="pending-dues" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}

import { Stack } from 'expo-router';

export default function PatrolsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" options={{ headerShown: true, title: 'Patrol Details' }} />
      <Stack.Screen name="active" options={{ headerShown: true, title: 'Active Patrol' }} />
    </Stack>
  );
}

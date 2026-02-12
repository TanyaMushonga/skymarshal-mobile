import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

export default function PatrolsLayout() {
  const { colors, isDark } = useTheme();
  const bg = isDark ? colors.background : '#FFFFFF';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: bg },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: { fontSize: 17, fontWeight: '600' },
        contentStyle: { backgroundColor: bg },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" options={{ headerShown: true, title: 'Patrol Details' }} />
      <Stack.Screen name="active" options={{ headerShown: true, title: 'Active Patrol' }} />
    </Stack>
  );
}

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="two-factor" options={{ presentation: 'modal' }} />
      <Stack.Screen name="forgot-password" options={{ presentation: 'modal' }} />
      <Stack.Screen name="verify-reset" options={{ presentation: 'modal' }} />
      <Stack.Screen name="new-password" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

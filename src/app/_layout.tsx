import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/stores/authStore';
import { setAuthFailureListener } from '@/api/client';
import { useToast } from '@/hooks/useToast';
import ToastModal from '@/components/common/ToastModal';
import { webSocketService } from '@/services/WebSocketService';
import { getAccessToken } from '@/lib/secureStorage';

import '../../global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

function RootLayoutNav() {
  const { isAuthenticated, isLoading, initialize, clearAuthState } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    initialize();
    setAuthFailureListener(() => {
      clearAuthState();
    });
  }, [initialize, clearAuthState]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  // WebSocket Connection Management
  useEffect(() => {
    let unsubscribe: () => void;

    const connectSocket = async () => {
      if (isAuthenticated) {
        const token = await getAccessToken();
        if (token) {
          webSocketService.connect(token);
        }
      } else {
        webSocketService.disconnect();
      }
    };

    connectSocket();

    // Register notification handler
    unsubscribe = webSocketService.addListener((data) => {
      if (data.type === 'notification') {
        console.log('[WebSocket] Notification received:', data);

        // Map notification types to toast types
        let toastType: 'success' | 'error' | 'info' | 'warning' = 'info';
        if (data.notification_type === 'alert') toastType = 'error';
        if (data.notification_type === 'mission_update') toastType = 'success';

        showToast(toastType, data.title, data.message);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
      // We don't disconnect on unmount here because RootLayout persists.
      // Disconnection is handled by the auth state change above or manual logout.
    };
  }, [isAuthenticated, showToast]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
        }}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="violations/[id]"
        options={{
          headerShown: true,
          title: 'Violation Details',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="detections/[id]"
        options={{
          headerShown: true,
          title: 'Detection Details',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <StatusBar style="auto" />
            <RootLayoutNav />
            <GlobalToasts />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function GlobalToasts() {
  const { toasts, hideToast, isVisible } = useToast();
  return <ToastModal visible={isVisible} toasts={toasts} onClose={hideToast} />;
}

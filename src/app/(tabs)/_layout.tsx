import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect } from 'react';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api';
import { UserHeader } from '@/components/dashboard/UserHeader';
import { useUIStore } from '@/stores/uiStore';
import { BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';

function AnimatedTabBar(props: BottomTabBarProps) {
  const { isTabBarVisible } = useUIStore();
  const tabBarHeight = Platform.OS === 'ios' ? 95 : 75;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(isTabBarVisible ? 0 : tabBarHeight + 20, {
            duration: 300,
          }),
        },
      ],
      opacity: withTiming(isTabBarVisible ? 1 : 0, {
        duration: 300,
      }),
    };
  });

  return (
    <Animated.View style={[styles.tabBarContainer, animatedStyle]}>
      <BottomTabBar {...props} />
    </Animated.View>
  );
}

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    const checkAndToggleDuty = async () => {
      if (user && !user.is_on_duty) {
        try {
          console.log('[TabLayout] User is off-duty, auto-toggling to ON DUTY...');
          const result = await authApi.toggleDuty();
          if (result.is_on_duty) {
            setUser({ ...user, is_on_duty: true });
            console.log('[TabLayout] Successfully set to ON DUTY');
          }
        } catch (error) {
          console.error('[TabLayout] Failed to auto-toggle duty:', error);
        }
      }
    };

    checkAndToggleDuty();
  }, [user?.is_on_duty]); // Depend on duty status to only run when it's falsely

  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: isDark ? '#080808' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#1A1A1A' : '#EEEEEE',
          height: Platform.OS === 'ios' ? 95 : 75,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 12,
          position: 'absolute',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          elevation: 25,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 20,
          borderWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="patrols"
        options={{
          title: 'Patrols',
          tabBarIcon: ({ color }) => <Ionicons name="car-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: true,
          header: () => (
            <SafeAreaView
              edges={['top']}
              style={{ backgroundColor: isDark ? colors.background : '#F9FAFB' }}>
              <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                <UserHeader />
              </View>
            </SafeAreaView>
          ),
          tabBarIcon: ({ color }) => (
            <View style={[styles.elevatedButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="home" size={28} color="#000000" />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '700',
            color: colors.primary,
            marginTop: 10,
          },
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => (
            <Ionicons name="notifications-outline" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  elevatedButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 40 : 30,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: '#000000',
  },
});

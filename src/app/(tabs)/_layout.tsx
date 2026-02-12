import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
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

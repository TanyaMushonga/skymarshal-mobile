import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { Card, Badge, Button } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user, logout } = useAuthStore();
  const {
    theme,
    notificationsEnabled,
    biometricEnabled,
    setTheme,
    setNotificationsEnabled,
    setBiometricEnabled,
  } = useSettingsStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: 'moon',
          label: 'Dark Mode',
          type: 'toggle',
          value: theme === 'dark',
          onToggle: (v: boolean) => setTheme(v ? 'dark' : 'light'),
        },
        {
          icon: 'notifications',
          label: 'Push Notifications',
          type: 'toggle',
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: 'finger-print',
          label: 'Biometric Login',
          type: 'toggle',
          value: biometricEnabled,
          onToggle: setBiometricEnabled,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'lock-closed',
          label: 'Change Password',
          type: 'link',
          onPress: () => router.push('/(auth)/new-password'),
        },
        {
          icon: 'shield-checkmark',
          label: 'Two-Factor Authentication',
          type: 'link',
          badge: '2FA Enabled',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle',
          label: 'Help Center',
          type: 'link',
          onPress: () => {},
        },
        {
          icon: 'document-text',
          label: 'Terms of Service',
          type: 'link',
          onPress: () => {},
        },
        {
          icon: 'information-circle',
          label: 'About',
          type: 'link',
          value: 'v1.0.0',
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? colors.background : '#F9FAFB' }}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Profile Header */}
        <Card variant="elevated" className="mb-4">
          <View className="flex-row items-center">
            <View className="mr-4">
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={{ width: 72, height: 72, borderRadius: 36 }}
                />
              ) : (
                <View className="h-18 w-18 bg-primary-100 dark:bg-primary-900/30 items-center justify-center rounded-full">
                  <Text className="text-primary-600 text-3xl font-bold">
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold" style={{ color: colors.text }}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text style={{ color: colors.textSecondary }}>{user?.email}</Text>
              <View className="mt-1 flex-row items-center">
                <Badge label={user?.role || 'OFFICER'} variant="primary" size="sm" />
                <Text className="ml-2" style={{ color: colors.textSecondary }}>
                  #{user?.force_number}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-4 flex-row">
            <View className="flex-1 items-center rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
              <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                24
              </Text>
              <Text style={{ color: colors.textSecondary }}>Patrols</Text>
            </View>
            <View className="w-3" />
            <View className="flex-1 items-center rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
              <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                156
              </Text>
              <Text style={{ color: colors.textSecondary }}>Detections</Text>
            </View>
            <View className="w-3" />
            <View className="flex-1 items-center rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
              <Text className="text-2xl font-bold text-red-500">12</Text>
              <Text style={{ color: colors.textSecondary }}>Violations</Text>
            </View>
          </View>
        </Card>

        {/* Duty Status */}
        <Card variant="elevated" className="mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Ionicons name="radio" size={20} color="#10B981" />
              </View>
              <View>
                <Text className="font-semibold" style={{ color: colors.text }}>
                  Duty Status
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  {user?.is_on_duty ? 'Currently on duty' : 'Off duty'}
                </Text>
              </View>
            </View>
            <Badge
              label={user?.is_on_duty ? 'ON DUTY' : 'OFF DUTY'}
              variant={user?.is_on_duty ? 'success' : 'default'}
              dot
            />
          </View>
        </Card>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <View key={section.title} className="mb-4">
            <Text
              className="mb-2 text-sm font-medium uppercase"
              style={{ color: colors.textSecondary }}>
              {section.title}
            </Text>
            <Card variant="elevated">
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  className={`flex-row items-center justify-between py-3 ${
                    index !== section.items.length - 1
                      ? 'border-b border-gray-100 dark:border-gray-800'
                      : ''
                  }`}
                  onPress={'onPress' in item ? item.onPress : undefined}
                  disabled={item.type === 'toggle'}>
                  <View className="flex-row items-center">
                    <Ionicons name={item.icon as any} size={22} color={colors.textSecondary} />
                    <Text className="ml-3 font-medium" style={{ color: colors.text }}>
                      {item.label}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    {'badge' in item && item.badge && (
                      <Badge label={item.badge} variant="success" size="sm" />
                    )}
                    {'value' in item && item.type !== 'toggle' && (
                      <Text style={{ color: colors.textSecondary }}>{String(item.value)}</Text>
                    )}
                    {item.type === 'toggle' && 'value' in item && 'onToggle' in item && (
                      <Switch
                        value={Boolean(item.value)}
                        onValueChange={item.onToggle}
                        trackColor={{ false: '#D1D5DB', true: '#FCD34D' }}
                        thumbColor={item.value ? '#F59E0B' : '#F9FAFB'}
                      />
                    )}
                    {item.type === 'link' && (
                      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout Button */}
        <Button
          title="Logout"
          variant="danger"
          icon={<Ionicons name="log-out-outline" size={20} color="#FFFFFF" />}
          onPress={handleLogout}
          className="mt-4"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

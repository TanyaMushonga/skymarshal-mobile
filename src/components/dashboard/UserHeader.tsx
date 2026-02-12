import React, { useEffect, useRef } from 'react';
import { View, Text, Switch, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth';
import { useTheme } from '@/contexts/ThemeContext';

export const UserHeader = () => {
  const { user, setUser } = useAuthStore();
  const { colors, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (user?.is_on_duty) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [user?.is_on_duty, pulseAnim]);

  const handleToggleDuty = async () => {
    try {
      const result = await authApi.toggleDuty();
      if (user) {
        setUser({ ...user, is_on_duty: result.is_on_duty });
      }
    } catch (error) {
      console.error('Failed to toggle duty:', error);
    }
  };

  return (
    <View className="mb-6 flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        <Image
          source={user?.profile_picture || 'https://via.placeholder.com/150'}
          className="h-14 w-14 rounded-full border-2 border-[#1A1A1A]"
          style={{ borderColor: isDark ? '#1A1A1A' : '#EEEEEE' }}
          contentFit="cover"
        />
        <View>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            {user?.first_name} {user?.last_name}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text style={{ color: colors.textSecondary }} className="text-sm">
              {user?.force_number}
            </Text>
            <View className="items-center justify-center">
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                  backgroundColor: user?.is_on_duty ? '#10B981' : '#666666',
                }}
                className="h-2 w-2 rounded-full"
              />
            </View>
            <Text
              style={{ color: colors.textSecondary }}
              className="text-xs uppercase tracking-wider">
              {user?.is_on_duty ? 'Active Duty' : 'Off Duty'}
            </Text>
          </View>
        </View>
      </View>

      <View className="items-center">
        <Switch
          value={user?.is_on_duty}
          onValueChange={handleToggleDuty}
          trackColor={{ false: '#767577', true: colors.primary + '80' }}
          thumbColor={user?.is_on_duty ? colors.primary : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
        />
        <Text
          className="mt-1 text-[10px] font-medium uppercase"
          style={{ color: colors.textSecondary }}>
          Duty Status
        </Text>
      </View>
    </View>
  );
};

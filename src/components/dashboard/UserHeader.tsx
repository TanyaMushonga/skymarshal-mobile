import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Image } from 'expo-image';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth';
import { useTheme } from '@/contexts/ThemeContext';

export const UserHeader = () => {
  const { user, setUser } = useAuthStore();
  const { colors, isDark } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const switchAnim = useRef(new Animated.Value(user?.is_on_duty ? 1 : 0)).current;

  useEffect(() => {
    if (user?.is_on_duty) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.8,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 900,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseOpacity, {
              toValue: 0,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(pulseOpacity, {
              toValue: 0.6,
              duration: 900,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      pulseOpacity.setValue(0);
    }
  }, [user?.is_on_duty]);

  const handleToggleDuty = async () => {
    Animated.spring(switchAnim, {
      toValue: user?.is_on_duty ? 0 : 1,
      useNativeDriver: false,
      tension: 80,
      friction: 10,
    }).start();

    try {
      const result = await authApi.toggleDuty();
      if (user) {
        setUser({ ...user, is_on_duty: result.is_on_duty });
      }
    } catch (error) {
      console.error('Failed to toggle duty:', error);
      // Revert animation on error
      Animated.spring(switchAnim, {
        toValue: user?.is_on_duty ? 1 : 0,
        useNativeDriver: false,
      }).start();
    }
  };

  const trackColor = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? '#2A2A2A' : '#E0E0E0', '#10B98140'],
  });

  const thumbTranslate = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const thumbColor = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#888888', '#10B981'],
  });

  const isOnDuty = user?.is_on_duty;
  const ACTIVE_COLOR = '#10B981';
  const INACTIVE_COLOR = '#6B7280';

  return (
    <View
      className="mb-6 overflow-hidden px-4 py-4"
      style={{
        backgroundColor: isDark ? '#111111' : '#F7F7F7',
        borderWidth: 1,
        borderColor: isDark ? '#1E1E1E' : '#E8E8E8',
      }}>
      {/* Top row */}
      <View className="flex-row items-center justify-between">
        {/* Avatar + identity */}
        <View className="flex-row items-center gap-3.5">
          {/* Avatar with status ring */}
          <View className="relative">
            <View
              style={{
                padding: 2,
                borderRadius: 9999,
                borderWidth: 2,
                borderColor: isOnDuty ? ACTIVE_COLOR : isDark ? '#2A2A2A' : '#DDDDDD',
              }}>
              <Image
                source={user?.profile_picture || 'https://via.placeholder.com/150'}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 9999,
                  backgroundColor: isDark ? '#1A1A1A' : '#E5E5E5',
                }}
                contentFit="cover"
              />
            </View>
            {/* Pulse ring */}
            {isOnDuty && (
              <Animated.View
                style={{
                  position: 'absolute',
                  top: -4,
                  left: -4,
                  right: -4,
                  bottom: -4,
                  borderRadius: 9999,
                  borderWidth: 2,
                  borderColor: ACTIVE_COLOR,
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseAnim }],
                }}
              />
            )}
          </View>

          {/* Name + meta */}
          <View className="gap-0.5">
            <Text
              style={{
                color: colors.text,
                fontSize: 20,
                fontWeight: '700',
                letterSpacing: -0.5,
                lineHeight: 24,
              }}>
              {user?.first_name}
            </Text>

            {/* Badge row */}
            <View className="flex-row items-center gap-2">
              {/* Force number chip */}
              <View
                style={{
                  backgroundColor: isDark ? '#1E1E1E' : '#EBEBEB',
                  borderRadius: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 11,
                    fontWeight: '600',
                    letterSpacing: 0.4,
                    fontVariant: ['tabular-nums'],
                  }}>
                  {user?.force_number}
                </Text>
              </View>

              {/* Divider dot */}
              <View
                style={{
                  width: 3,
                  height: 3,
                  borderRadius: 9999,
                  backgroundColor: isDark ? '#333333' : '#CCCCCC',
                }}
              />

              {/* Status indicator */}
              <View className="flex-row items-center gap-1.5">
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 9999,
                    backgroundColor: isOnDuty ? ACTIVE_COLOR : INACTIVE_COLOR,
                  }}
                />
                <Text
                  style={{
                    color: isOnDuty ? ACTIVE_COLOR : INACTIVE_COLOR,
                    fontSize: 11,
                    fontWeight: '600',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                  }}>
                  {isOnDuty ? 'On Duty' : 'Off Duty'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Custom toggle */}
        <Pressable onPress={handleToggleDuty} hitSlop={8}>
          <View className="items-center gap-1.5">
            {/* Toggle track */}
            <Animated.View
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                backgroundColor: trackColor,
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: isOnDuty ? ACTIVE_COLOR + '60' : isDark ? '#2E2E2E' : '#D0D0D0',
              }}>
              {/* Thumb */}
              <Animated.View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: thumbColor,
                  transform: [{ translateX: thumbTranslate }],
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              />
            </Animated.View>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 9,
                fontWeight: '700',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}>
              Duty
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

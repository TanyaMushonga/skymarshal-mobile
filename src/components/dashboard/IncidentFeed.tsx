import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { safeFormatDistanceToNow } from '@/lib/dateUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { Violation } from '@/types/api';

interface Props {
  alerts: Violation[];
}

export const IncidentFeed = ({ alerts }: Props) => {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const IncidentItem = ({ item }: { item: Violation }) => {
    const scale = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
    };

    const onPressOut = () => {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push(`/violations/${item.id}`)}
        className="mb-3">
        <Animated.View
          style={[
            { transform: [{ scale }] },
            {
              backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF',
              borderColor: isDark ? '#1A1A1A' : '#EEEEEE',
              borderWidth: 1,
            },
          ]}
          className="flex-row items-center rounded-2xl p-3 shadow-sm">
          <View
            style={{ backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full">
            <Ionicons name="notifications-outline" size={20} color={colors.primary} />
          </View>
          <View className="ml-1 flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-bold" style={{ color: colors.text }}>
                {item.violation_type}
              </Text>
              {item.status === 'NEW' && <View className="h-2 w-2 rounded-full bg-red-500" />}
            </View>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              {safeFormatDistanceToNow(item.timestamp)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="mb-6">
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xs font-black uppercase tracking-[2px] text-slate-500">
          Recent Incidents
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/alerts')}>
          <Text className="text-xs font-bold text-blue-500">View All</Text>
        </TouchableOpacity>
      </View>
      {alerts.slice(0, 5).map((item) => (
        <IncidentItem key={item.id} item={item} />
      ))}
      {alerts.length === 0 && (
        <View className="items-center py-8">
          <Ionicons name="shield-checkmark" size={40} color="#10B981" />
          <Text className="mt-2 text-xs font-medium text-slate-400">All clear for now</Text>
        </View>
      )}
    </View>
  );
};

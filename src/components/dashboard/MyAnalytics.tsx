import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { OfficerStats } from '@/types/api';

interface Props {
  stats: OfficerStats | undefined;
}

export const MyAnalytics = ({ stats }: Props) => {
  const { colors, isDark } = useTheme();

  if (!stats) return null;

  return (
    <View
      className="mb-8 rounded-3xl p-6"
      style={{ backgroundColor: isDark ? '#1E293B' : '#F8FAFC' }}>
      <Text className="mb-4 text-xs font-black uppercase tracking-[2px] text-slate-500">
        Officer Performance
      </Text>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          <View className="rounded-2xl bg-blue-500/10 p-3">
            <Ionicons name="time" size={24} color="#3B82F6" />
          </View>
          <View>
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              {stats.hours_patrolled_this_week}h
            </Text>
            <Text className="text-xs text-slate-500">Patrolled this week</Text>
          </View>
        </View>
        <View className="items-end">
          <View className="flex-row items-center gap-1">
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              {stats.performance_rating.toFixed(1)}
            </Text>
          </View>
          <Text className="text-xs text-slate-500">Rating</Text>
        </View>
      </View>
    </View>
  );
};

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

  const dividerColor = isDark ? '#1F1F1F' : '#E8E8E8';

  return (
    <View className="mb-8">
      {/* Section header */}
      <Text
        className="mb-3 px-1 text-[12px] font-semibold uppercase tracking-widest"
        style={{ color: colors.textSecondary }}>
        Officer Performance
      </Text>

      {/* Row: Hours patrolled */}
      <View
        className="flex-row items-center border-t px-1 py-4"
        style={{ borderTopColor: dividerColor }}>
        <View
          className={`mr-3.5 h-9 w-9 items-center justify-center rounded-lg ${
            isDark ? 'bg-blue-900/20' : 'bg-blue-50'
          }`}>
          <Ionicons name="time-outline" size={20} color="#3B82F6" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium leading-[22px]" style={{ color: colors.text }}>
            Hours Patrolled
          </Text>
          <Text className="mt-0.5 text-[13px]" style={{ color: colors.textSecondary }}>
            This week
          </Text>
        </View>
        <Text className="text-[22px] font-bold tracking-tighter" style={{ color: colors.text }}>
          {stats.hours_patrolled_this_week}
          <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            h
          </Text>
        </Text>
      </View>

      {/* Row: Performance rating */}
      <View
        className="flex-row items-center border-b border-t px-1 py-4"
        style={{ borderColor: dividerColor }}>
        <View
          className={`mr-3.5 h-9 w-9 items-center justify-center rounded-lg ${
            isDark ? 'bg-amber-900/20' : 'bg-amber-50'
          }`}>
          <Ionicons name="star-outline" size={20} color="#F59E0B" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium leading-[22px]" style={{ color: colors.text }}>
            Performance Rating
          </Text>
          <Text className="mt-0.5 text-[13px]" style={{ color: colors.textSecondary }}>
            Overall score
          </Text>
        </View>
        <Text className="text-[22px] font-bold tracking-tighter" style={{ color: colors.text }}>
          {stats.performance_rating.toFixed(1)}
          <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            /5
          </Text>
        </Text>
      </View>
    </View>
  );
};

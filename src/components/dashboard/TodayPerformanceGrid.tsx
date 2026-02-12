import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { TodayStats } from '@/types/api';

interface Props {
  stats: TodayStats;
}

type StatItemProps = {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBg: string;
  isLast?: boolean;
};

export const TodayPerformanceGrid = ({ stats }: Props) => {
  const { colors, isDark } = useTheme();

  const dividerColor = isDark ? '#1F1F1F' : '#E8E8E8';

  const StatItem = ({ label, value, icon, iconColor, iconBg, isLast }: StatItemProps) => (
    <View
      className={`flex-1 items-center py-4 ${isLast ? '' : 'border-r'}`}
      style={{ borderRightColor: dividerColor }}>
      <View
        className="mb-2 h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: iconBg }}>
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>
      <Text
        className="leading-7.5 text-[26px] font-bold tracking-tighter"
        style={{ color: colors.text }}>
        {value}
      </Text>
      <Text
        className="mt-1 text-[11px] font-medium uppercase tracking-widest"
        style={{ color: colors.textSecondary }}>
        {label}
      </Text>
    </View>
  );

  return (
    <View className="mb-8">
      <Text
        className="mb-3 px-1 text-[12px] font-semibold uppercase tracking-widest"
        style={{ color: colors.textSecondary }}>
        Today&apos;s Impact
      </Text>

      <View className="flex-row border-b border-t" style={{ borderColor: dividerColor }}>
        <StatItem
          label="Patrols"
          value={stats.patrols}
          icon="map-outline"
          iconColor={colors.primary}
          iconBg={isDark ? '#0D1F2D' : '#EFF6FF'}
        />
        <StatItem
          label="Detections"
          value={stats.detections}
          icon="layers-outline"
          iconColor={colors.primary}
          iconBg={isDark ? '#0D1F2D' : '#EFF6FF'}
        />
        <StatItem
          label="Violations"
          value={stats.violations}
          icon="alert-circle-outline"
          iconColor="#EF4444"
          iconBg={isDark ? '#2A0F0F' : '#FEF2F2'}
          isLast
        />
      </View>
    </View>
  );
};

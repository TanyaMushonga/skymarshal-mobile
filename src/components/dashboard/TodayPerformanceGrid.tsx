import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { TodayStats } from '@/types/api';

interface Props {
  stats: TodayStats;
}

export const TodayPerformanceGrid = ({ stats }: Props) => {
  const { colors, isDark } = useTheme();

  const StatCard = ({
    label,
    value,
    icon,
    color,
  }: {
    label: string;
    value: number;
    icon: any;
    color: string;
  }) => (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? '#0A0A0A' : '#FFFFFF' },
        !isDark && styles.shadow,
        isDark && { borderColor: '#1A1A1A', borderWidth: 1 },
      ]}
      className="flex-1 items-center justify-center rounded-3xl p-4">
      <View style={{ backgroundColor: color + '20' }} className="mb-2 rounded-full p-2">
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="text-2xl font-black" style={{ color: colors.text }}>
        {value}
      </Text>
      <Text
        className="text-[10px] font-bold uppercase tracking-wider text-slate-500"
        style={{ color: colors.textSecondary }}>
        {label}
      </Text>
    </View>
  );

  return (
    <View className="mb-6">
      <Text className="mb-4 text-xs font-black uppercase tracking-[2px] text-slate-500">
        Today&apos;s Impact
      </Text>
      <View className="flex-row gap-3">
        <StatCard label="Patrols" value={stats.patrols} icon="map-outline" color={colors.primary} />
        <StatCard
          label="Detections"
          value={stats.detections}
          icon="layers-outline"
          color={colors.primary}
        />
        <StatCard
          label="Violations"
          value={stats.violations}
          icon="alert-circle-outline"
          color="#EF4444"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 120,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
});

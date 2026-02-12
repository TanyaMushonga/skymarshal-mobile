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
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        borderRightWidth: isLast ? 0 : 1,
        borderRightColor: dividerColor,
      }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}>
        <Ionicons name={icon} size={17} color={iconColor} />
      </View>
      <Text
        style={{
          color: colors.text,
          fontSize: 26,
          fontWeight: '700',
          letterSpacing: -1,
          lineHeight: 30,
        }}>
        {value}
      </Text>
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 0.4,
          marginTop: 4,
          textTransform: 'uppercase',
        }}>
        {label}
      </Text>
    </View>
  );

  return (
    <View className="mb-8">
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 12,
          fontWeight: '600',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginBottom: 12,
          paddingHorizontal: 4,
        }}>
        Today&apos;s Impact
      </Text>

      <View
        style={{
          flexDirection: 'row',
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: dividerColor,
        }}>
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

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
        style={{
          color: colors.textSecondary,
          fontSize: 12,
          fontWeight: '600',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginBottom: 12,
          paddingHorizontal: 4,
        }}>
        Officer Performance
      </Text>

      {/* Row: Hours patrolled */}
      <View
        style={{ borderTopWidth: 1, borderTopColor: dividerColor }}
        className="flex-row items-center px-1 py-4">
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: isDark ? '#1A2A3A' : '#EFF6FF',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}>
          <Ionicons name="time-outline" size={20} color="#3B82F6" />
        </View>
        <View className="flex-1">
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500', lineHeight: 22 }}>
            Hours Patrolled
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 1 }}>This week</Text>
        </View>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700', letterSpacing: -0.5 }}>
          {stats.hours_patrolled_this_week}
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>h</Text>
        </Text>
      </View>

      {/* Row: Performance rating */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: dividerColor,
          borderBottomWidth: 1,
          borderBottomColor: dividerColor,
        }}
        className="flex-row items-center px-1 py-4">
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: isDark ? '#2A2010' : '#FFFBEB',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}>
          <Ionicons name="star-outline" size={20} color="#F59E0B" />
        </View>
        <View className="flex-1">
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500', lineHeight: 22 }}>
            Performance Rating
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 1 }}>
            Overall score
          </Text>
        </View>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700', letterSpacing: -0.5 }}>
          {stats.performance_rating.toFixed(1)}
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textSecondary }}>/5</Text>
        </Text>
      </View>
    </View>
  );
};

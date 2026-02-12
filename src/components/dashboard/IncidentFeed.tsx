import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { safeFormatDistanceToNow } from '@/lib/dateUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { Violation } from '@/types/api';
import { useUIStore } from '@/stores/uiStore';

interface Props {
  alerts: Violation[];
}

const SEVERITY_CONFIG: Record<string, { color: string; bg: string }> = {
  HIGH: { color: '#EF4444', bg: '#2A0F0F' },
  MEDIUM: { color: '#F59E0B', bg: '#2A1A08' },
  LOW: { color: '#3B82F6', bg: '#0D1525' },
};

const IncidentItem = ({ item, isLast }: { item: Violation; isLast: boolean }) => {
  const { colors, isDark } = useTheme();
  const { openViolationDetail } = useUIStore();
  const scale = useRef(new Animated.Value(1)).current;

  const cfg = SEVERITY_CONFIG[item.severity || 'LOW'] || SEVERITY_CONFIG.LOW;
  const dividerColor = isDark ? '#1F1F1F' : '#E8E8E8';

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.985,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => openViolationDetail(item.id)}>
      <Animated.View
        style={{
          transform: [{ scale }],
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: 4,
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: dividerColor,
        }}>
        {/* Icon */}
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: isDark ? cfg.bg : cfg.color + '15',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}>
          <Ionicons name="warning-outline" size={18} color={cfg.color} />
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 15,
                fontWeight: '500',
                lineHeight: 20,
              }}
              numberOfLines={1}>
              {item.violation_type}
            </Text>
            {item.status === 'NEW' && (
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#EF4444',
                }}
              />
            )}
          </View>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 13,
              marginTop: 2,
              lineHeight: 18,
            }}>
            {safeFormatDistanceToNow(item.timestamp)}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color={isDark ? '#444' : '#CCC'} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export const IncidentFeed = ({ alerts }: Props) => {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const dividerColor = isDark ? '#1F1F1F' : '#E8E8E8';
  const visible = alerts.slice(0, 5);

  return (
    <View className="mb-8">
      {/* Section header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          paddingHorizontal: 4,
        }}>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 12,
            fontWeight: '600',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
          }}>
          Recent Incidents
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/alerts')} hitSlop={8}>
          <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {visible.length > 0 ? (
        <View style={{ borderTopWidth: 1, borderTopColor: dividerColor }}>
          {visible.map((item, index) => (
            <IncidentItem key={item.id} item={item} isLast={index === visible.length - 1} />
          ))}
        </View>
      ) : (
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Ionicons name="shield-checkmark-outline" size={36} color="#10B981" />
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              fontWeight: '500',
              marginTop: 10,
            }}>
            All clear
          </Text>
        </View>
      )}
    </View>
  );
};

import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {} from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { safeFormatSnapshot } from '@/lib/dateUtils';
import { patrolsApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { useUIStore } from '@/stores/uiStore';
import { PatrolDetailModal } from '@/components/modals/PatrolDetailModal';
import { TelemetryModal } from '@/components/modals/TelemetryModal';
import type { Patrol, PatrolStatus } from '@/types/api';

const STATUS_CONFIG: Record<
  PatrolStatus,
  { label: string; color: string; darkBg: string; lightBg: string }
> = {
  ACTIVE: { label: 'Active', color: '#10B981', darkBg: '#0D2A1A', lightBg: '#ECFDF5' },
  COMPLETED: { label: 'Completed', color: '#3B82F6', darkBg: '#0D1525', lightBg: '#EFF6FF' },
  CANCELLED: { label: 'Cancelled', color: '#6B7280', darkBg: '#1A1A1A', lightBg: '#F3F4F6' },
};

const FILTERS: { label: string; value: PatrolStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const formatDuration = (seconds?: number) => {
  if (seconds === undefined || seconds === null) return '—';
  const h = Math.floor(Math.abs(seconds) / 3600);
  const m = Math.floor((Math.abs(seconds) % 3600) / 60);
  const prefix = seconds < 0 ? '-' : '';
  if (h === 0) return `${prefix}${m}m`;
  return `${prefix}${h}h ${m}m`;
};

export default function PatrolsScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const { openPatrolDetail } = useUIStore();
  const [filter, setFilter] = useState<PatrolStatus | 'ALL'>('ALL');

  const { data, isLoading, isFetchingNextPage, refetch, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ['patrols', filter, user?.email],
      queryFn: ({ pageParam = 0 }) =>
        patrolsApi.list({
          ...(filter !== 'ALL' && { status: filter }),
          officer__email: user?.email,
          limit: 20,
          offset: pageParam,
        }),
      getNextPageParam: (lastPage, allPages) => {
        const currentOffset = allPages.length * 20;
        return currentOffset < lastPage.count ? currentOffset : undefined;
      },
      enabled: !!user?.email,
      initialPageParam: 0,
    });

  const patrols = data?.pages.flatMap((page) => page.results) || [];

  const divider = isDark ? '#1F1F1F' : '#E8E8E8';
  const bg = isDark ? colors.background : '#FFFFFF';

  // ─── Patrol row ────────────────────────────────────────────────────────────
  const PatrolRow = ({ item, index }: { item: Patrol; index: number }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const cfg = STATUS_CONFIG[item.status];
    const isLast = index === patrols.length - 1;

    const onPressIn = () =>
      Animated.spring(scale, {
        toValue: 0.985,
        useNativeDriver: true,
        tension: 200,
        friction: 12,
      }).start();
    const onPressOut = () =>
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 12,
      }).start();

    const handlePress = () => openPatrolDetail(item.id);

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={handlePress}>
        <Animated.View
          style={{
            transform: [{ scale }],
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderBottomWidth: isLast ? 0 : 1,
            borderBottomColor: divider,
          }}>
          {/* Icon */}
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: isDark ? cfg.darkBg : cfg.lightBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              flexShrink: 0,
            }}>
            <Ionicons
              name={item.status === 'ACTIVE' ? 'radio-outline' : 'car-outline'}
              size={18}
              color={cfg.color}
            />
          </View>

          {/* Main content */}
          <View style={{ flex: 1 }}>
            {/* Row 1: ID + status chip */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 17,
                  fontWeight: '700',
                  fontVariant: ['tabular-nums'],
                  lineHeight: 22,
                }}>
                #{item.id.slice(0, 8).toUpperCase()}
              </Text>
              <View
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                  backgroundColor: isDark ? cfg.darkBg : cfg.lightBg,
                }}>
                <Text
                  style={{
                    color: cfg.color,
                    fontSize: 11,
                    fontWeight: '700',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}>
                  {cfg.label}
                </Text>
              </View>
            </View>

            {/* Row 2: Date */}
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                fontWeight: '500',
                marginBottom: 6,
                lineHeight: 20,
              }}>
              {safeFormatSnapshot(item.start_time || item.started_at, 'MMM d, yyyy · HH:mm')}
            </Text>

            {/* Row 3: Stats inline */}
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>
                  {formatDuration(
                    item.flight_duration_seconds !== undefined
                      ? item.flight_duration_seconds
                      : item.duration
                  )}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="layers-outline" size={13} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>
                  {item.detection_count} detections
                </Text>
              </View>
              {item.violation_count > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="warning-outline" size={13} color="#EF4444" />
                  <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '600' }}>
                    {item.violation_count}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Ionicons name="chevron-forward" size={15} color={isDark ? '#333' : '#CCC'} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: divider,
        }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 28,
            fontWeight: '700',
            letterSpacing: -0.8,
            lineHeight: 34,
          }}>
          My Patrols
        </Text>
      </View>

      {/* Filter chips */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          paddingVertical: 12,
          gap: 8,
          borderBottomWidth: 1,
          borderBottomColor: divider,
        }}>
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <TouchableOpacity
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: active ? colors.primary : isDark ? '#1A1A1A' : '#F0F0F0',
              }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: active ? '700' : '600',
                  color: active ? '#000000' : colors.textSecondary,
                  letterSpacing: 0.1,
                }}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <View style={{ borderTopWidth: 0, flex: 1 }}>
        <FlatList
          data={patrols}
          renderItem={({ item, index }) => <PatrolRow item={item} index={index} />}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 20 }}>
                <Text style={{ textAlign: 'center', color: colors.textSecondary }}>
                  Loading more...
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 64 }}>
              <Ionicons name="car-outline" size={40} color={isDark ? '#333' : '#CCC'} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 15,
                  fontWeight: '500',
                  marginTop: 14,
                }}>
                No patrols found
              </Text>
              <Text style={{ color: isDark ? '#333' : '#CCC', fontSize: 13, marginTop: 4 }}>
                {filter !== 'ALL'
                  ? `No ${filter.toLowerCase()} patrols`
                  : 'Your patrols will appear here'}
              </Text>
            </View>
          }
        />
      </View>
      <PatrolDetailModal />
      <TelemetryModal />
    </SafeAreaView>
  );
}

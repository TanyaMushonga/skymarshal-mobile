import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { notificationsApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';
import { safeFormatDistanceToNow } from '@/lib/dateUtils';
import type { Notification } from '@/types/api';
import { useScrollTracking } from '@/hooks/useScrollTracking';

const NOTIFICATION_TYPES: { label: string; value: string }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Violation Detected', value: 'violation_detected' },
  { label: 'Patrol Started', value: 'patrol_started' },
  { label: 'Patrol Ended', value: 'patrol_ended' },
  { label: 'Low Battery', value: 'low_battery' },
  { label: 'Stream Health', value: 'stream_health' },
  { label: 'Mission Update', value: 'mission_update' },
  { label: 'System Alert', value: 'system_alert' },
  { label: 'Emergency', value: 'emergency' },
  { label: 'General', value: 'general' },
];

export default function AlertsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string | 'ALL'>('ALL');
  const { onScroll } = useScrollTracking();

  const {
    data: notifications,
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['notifications', selectedType],
    queryFn: () =>
      notificationsApi.list(
        (selectedType !== 'ALL' ? { notification_type: selectedType } : {}) as any
      ),
  });

  // Normalize notifications response (API may return array or paginated { results: [] })
  const notificationsList: Notification[] = Array.isArray(notifications)
    ? notifications
    : (notifications?.results as Notification[]) || [];

  // (no separate violations tab anymore)

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      if (!notification.is_read) markReadMutation.mutate(notification.id);
      if (notification.related_violation) {
        router.push(`/violations/${notification.related_violation}`);
      }
    },
    [markReadMutation, router]
  );

  const unreadCount = notificationsList.filter((n) => !n.is_read).length || 0;

  const divider = isDark ? '#1F1F1F' : '#E8E8E8';
  const bg = isDark ? colors.background : '#FFFFFF';

  // ─── Notification row ──────────────────────────────────────────────────────
  const getNotificationConfigForType = (type?: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('violation'))
      return {
        icon: 'alert-circle-outline',
        color: colors.error,
        darkBg: '#2A0F0F',
        lightBg: '#FEF2F2',
      };
    if (t.includes('patrol'))
      return { icon: 'car-outline', color: colors.primary, darkBg: '#0D1525', lightBg: '#EFF6FF' };
    if (t.includes('low_battery') || t.includes('battery'))
      return {
        icon: 'battery-half-outline',
        color: colors.warning,
        darkBg: '#2A1708',
        lightBg: '#FFF7ED',
      };
    if (t.includes('system') || t.includes('alert'))
      return {
        icon: 'construct-outline',
        color: colors.textSecondary,
        darkBg: '#1A1A1A',
        lightBg: '#F3F4F6',
      };
    if (t.includes('emergency'))
      return {
        icon: 'warning-outline',
        color: colors.error,
        darkBg: '#2A0F0F',
        lightBg: '#FEE2E2',
      };
    return {
      icon: 'notifications-outline',
      color: colors.primary,
      darkBg: '#0D1525',
      lightBg: '#EFF6FF',
    };
  };

  const renderNotification = ({ item, index }: { item: Notification; index: number }) => {
    const cfg = getNotificationConfigForType(item.notification_type);
    const isLast = index === notificationsList.length - 1;

    return (
      <TouchableOpacity onPress={() => handleNotificationPress(item)} activeOpacity={0.8}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderBottomWidth: isLast ? 0 : 1,
            borderBottomColor: divider,
            backgroundColor: !item.is_read ? colors.primaryLight : 'transparent',
            borderRadius: 8,
            marginHorizontal: 8,
            marginVertical: 6,
          }}>
          {/* Icon */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              backgroundColor: isDark ? cfg.darkBg : cfg.lightBg,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              flexShrink: 0,
            }}>
            <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
          </View>

          {/* Text */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: item.is_read ? '500' : '700',
                  lineHeight: 20,
                  flex: 1,
                }}
                numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={{ color: isDark ? '#666' : '#888', fontSize: 12, marginLeft: 8 }}>
                {safeFormatDistanceToNow(item.created_at)}
              </Text>
            </View>

            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                marginTop: 6,
                lineHeight: 20,
              }}>
              {item.message ?? (item as any).body}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={16}
            color={isDark ? '#333' : '#AAA'}
            style={{ marginLeft: 12, alignSelf: 'center' }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  // (violations list removed — showing notifications only)

  // ─── Empty states ──────────────────────────────────────────────────────────
  const EmptyNotifications = () => (
    <View style={{ alignItems: 'center', paddingVertical: 64 }}>
      <Ionicons name="notifications-off-outline" size={40} color={isDark ? '#333' : '#CCC'} />
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 15,
          fontWeight: '500',
          marginTop: 14,
        }}>
        No notifications
      </Text>
      <Text
        style={{
          color: isDark ? '#333' : '#CCC',
          fontSize: 13,
          marginTop: 4,
        }}>
        You&apos;re all caught up
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: divider,
        }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 28,
              fontWeight: '700',
              letterSpacing: -0.8,
              lineHeight: 34,
            }}>
            Alerts
          </Text>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={() => markAllReadMutation.mutate()}
              hitSlop={8}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Ionicons name="checkmark-done-outline" size={16} color={colors.primary} />
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 13,
                  fontWeight: '600',
                }}>
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs removed — replaced by horizontal type chips below */}

      {/* ── Notification Type Chips (horizontal) ───────────────────────────── */}
      <View style={{ paddingHorizontal: 12, paddingTop: 10 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}>
          {NOTIFICATION_TYPES.map((t) => {
            const active = selectedType === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                onPress={() => setSelectedType(t.value)}
                activeOpacity={0.8}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 10,
                  backgroundColor: active ? colors.primary : isDark ? '#1A1A1A' : '#F3F4F6',
                }}>
                <Text
                  style={{
                    color: active ? '#FFFFFF' : colors.textSecondary,
                    fontWeight: active ? '700' : '600',
                    fontSize: 14,
                  }}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── List ───────────────────────────────────────────────────────────── */}
      <View style={{ marginTop: 10, flex: 1 }}>
        {/* Section border top */}
        <View style={{ borderTopWidth: 1, borderTopColor: divider, flex: 1 }}>
          <FlatList
            data={notificationsList}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            onScroll={onScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={notificationsLoading}
                onRefresh={refetchNotifications}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={<EmptyNotifications />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

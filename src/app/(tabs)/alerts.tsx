import React, { useState, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { notificationsApi, violationsApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';
import { safeFormatDistanceToNow } from '@/lib/dateUtils';
import type { Notification } from '@/types/api';

type AlertTab = 'notifications' | 'violations';

const NOTIFICATION_CONFIG: Record<
  string,
  {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    color: string;
    darkBg: string;
    lightBg: string;
  }
> = {
  VIOLATION: {
    icon: 'alert-circle-outline',
    color: '#EF4444',
    darkBg: '#2A0F0F',
    lightBg: '#FEF2F2',
  },
  PATROL: { icon: 'car-outline', color: '#3B82F6', darkBg: '#0D1525', lightBg: '#EFF6FF' },
  SYSTEM: { icon: 'construct-outline', color: '#6B7280', darkBg: '#1A1A1A', lightBg: '#F3F4F6' },
  DEFAULT: {
    icon: 'notifications-outline',
    color: '#3B82F6',
    darkBg: '#0D1525',
    lightBg: '#EFF6FF',
  },
};

export default function AlertsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AlertTab>('notifications');

  // Animated indicator for segmented control
  const indicatorX = useRef(new Animated.Value(0)).current;

  const {
    data: notifications,
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list({}),
  });

  const {
    data: violations,
    isLoading: violationsLoading,
    refetch: refetchViolations,
  } = useQuery({
    queryKey: ['violations', 'all'],
    queryFn: () => violationsApi.list({ limit: 50 }),
  });

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

  const handleTabSwitch = (tab: AlertTab) => {
    setActiveTab(tab);
    Animated.spring(indicatorX, {
      toValue: tab === 'notifications' ? 0 : 1,
      useNativeDriver: false,
      tension: 120,
      friction: 14,
    }).start();
  };

  const unreadCount = notifications?.results?.filter((n) => !n.is_read).length || 0;

  const divider = isDark ? '#1F1F1F' : '#E8E8E8';
  const bg = isDark ? colors.background : '#FFFFFF';
  const segBg = isDark ? '#1A1A1A' : '#F0F0F0';

  // ─── Notification row ──────────────────────────────────────────────────────
  const renderNotification = ({ item, index }: { item: Notification; index: number }) => {
    const cfg = NOTIFICATION_CONFIG[item.notification_type] ?? NOTIFICATION_CONFIG.DEFAULT;
    const isLast = index === (notifications?.results?.length ?? 0) - 1;

    return (
      <TouchableOpacity onPress={() => handleNotificationPress(item)} activeOpacity={0.7}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderBottomWidth: isLast ? 0 : 1,
            borderBottomColor: divider,
            backgroundColor: !item.is_read
              ? isDark
                ? 'rgba(59,130,246,0.04)'
                : 'rgba(59,130,246,0.03)'
              : 'transparent',
          }}>
          {/* Unread accent bar */}
          {!item.is_read && (
            <View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 3,
                backgroundColor: colors.primary,
              }}
            />
          )}

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
            <Ionicons name={cfg.icon} size={18} color={cfg.color} />
          </View>

          {/* Text */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 15,
                  fontWeight: item.is_read ? '400' : '600',
                  lineHeight: 20,
                  flex: 1,
                }}
                numberOfLines={1}>
                {item.title}
              </Text>
              {!item.is_read && (
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: colors.primary,
                    flexShrink: 0,
                  }}
                />
              )}
            </View>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                lineHeight: 18,
              }}
              numberOfLines={2}>
              {item.body}
            </Text>
            <Text
              style={{
                color: isDark ? '#444' : '#BBBBC0',
                fontSize: 12,
                marginTop: 4,
              }}>
              {safeFormatDistanceToNow(item.created_at)}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={15}
            color={isDark ? '#333' : '#CCC'}
            style={{ marginLeft: 8, marginTop: 2 }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Violation row ─────────────────────────────────────────────────────────
  const renderViolation = ({ item, index }: { item: any; index: number }) => {
    const isNew = item.status === 'NEW';
    const isLast = index === (violations?.results?.length ?? 0) - 1;

    return (
      <TouchableOpacity onPress={() => router.push(`/violations/${item.id}`)} activeOpacity={0.7}>
        <View
          style={{
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
              backgroundColor: isDark ? '#2A0F0F' : '#FEF2F2',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
              flexShrink: 0,
            }}>
            <Ionicons name="warning-outline" size={18} color="#EF4444" />
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 15,
                  fontWeight: '500',
                  lineHeight: 20,
                  letterSpacing: 0.2,
                  fontVariant: ['tabular-nums'],
                }}>
                {item.detection?.license_plate || '—'}
              </Text>
              {/* Violation type chip */}
              <View
                style={{
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 4,
                  backgroundColor: isDark ? '#2A0F0F' : '#FEE2E2',
                }}>
                <Text
                  style={{
                    color: '#EF4444',
                    fontSize: 10,
                    fontWeight: '700',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}>
                  {item.violation_type}
                </Text>
              </View>
              {isNew && (
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: '#EF4444',
                  }}
                />
              )}
            </View>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                lineHeight: 18,
              }}>
              {item.recorded_speed ? `${item.recorded_speed} km/h · ` : ''}
              {safeFormatDistanceToNow(item.timestamp)}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={15}
            color={isDark ? '#333' : '#CCC'}
            style={{ marginLeft: 8 }}
          />
        </View>
      </TouchableOpacity>
    );
  };

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

  const EmptyViolations = () => (
    <View style={{ alignItems: 'center', paddingVertical: 64 }}>
      <Ionicons name="shield-checkmark-outline" size={40} color="#10B981" />
      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 15,
          fontWeight: '500',
          marginTop: 14,
        }}>
        No violations
      </Text>
      <Text style={{ color: isDark ? '#333' : '#CCC', fontSize: 13, marginTop: 4 }}>
        All clear in your area
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
          {activeTab === 'notifications' && unreadCount > 0 && (
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

      {/* ── Segmented control ──────────────────────────────────────────────── */}
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 14,
          marginBottom: 4,
          height: 40,
          borderRadius: 10,
          backgroundColor: segBg,
          flexDirection: 'row',
          padding: 3,
          position: 'relative',
        }}>
        {/* Sliding pill */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 3,
            bottom: 3,
            width: '50%',
            borderRadius: 8,
            backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.4 : 0.1,
            shadowRadius: 3,
            elevation: 2,
            left: indicatorX.interpolate({
              inputRange: [0, 1],
              outputRange: ['0.5%', '50%'],
            }),
          }}
        />

        {/* Tab: Notifications */}
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            zIndex: 1,
          }}
          onPress={() => handleTabSwitch('notifications')}
          activeOpacity={0.8}>
          <Text
            style={{
              color: activeTab === 'notifications' ? colors.text : colors.textSecondary,
              fontSize: 13,
              fontWeight: activeTab === 'notifications' ? '600' : '400',
              letterSpacing: 0.1,
            }}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View
              style={{
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: '#EF4444',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4,
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: '700',
                  fontVariant: ['tabular-nums'],
                }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Tab: Violations */}
        <TouchableOpacity
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            zIndex: 1,
          }}
          onPress={() => handleTabSwitch('violations')}
          activeOpacity={0.8}>
          <Text
            style={{
              color: activeTab === 'violations' ? colors.text : colors.textSecondary,
              fontSize: 13,
              fontWeight: activeTab === 'violations' ? '600' : '400',
              letterSpacing: 0.1,
            }}>
            Violations
          </Text>
          {(violations?.results?.length ?? 0) > 0 && (
            <View
              style={{
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: isDark ? '#2A0F0F' : '#FEE2E2',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4,
              }}>
              <Text
                style={{
                  color: '#EF4444',
                  fontSize: 10,
                  fontWeight: '700',
                  fontVariant: ['tabular-nums'],
                }}>
                {violations?.results?.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── List ───────────────────────────────────────────────────────────── */}
      <View style={{ marginTop: 10, flex: 1 }}>
        {/* Section border top */}
        <View style={{ borderTopWidth: 1, borderTopColor: divider, flex: 1 }}>
          {activeTab === 'notifications' ? (
            <FlatList
              data={notifications?.results || []}
              renderItem={renderNotification}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={
                <RefreshControl
                  refreshing={notificationsLoading}
                  onRefresh={refetchNotifications}
                  tintColor={colors.primary}
                />
              }
              ListEmptyComponent={<EmptyNotifications />}
            />
          ) : (
            <FlatList
              data={violations?.results || []}
              renderItem={renderViolation}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={
                <RefreshControl
                  refreshing={violationsLoading}
                  onRefresh={refetchViolations}
                  tintColor={colors.primary}
                />
              }
              ListEmptyComponent={<EmptyViolations />}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

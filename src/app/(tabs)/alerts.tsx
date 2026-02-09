import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';

import { Card, Badge } from '@/components/ui';
import { notificationsApi, violationsApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';
import type { Notification } from '@/types/api';

type AlertTab = 'notifications' | 'violations';

export default function AlertsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AlertTab>('notifications');

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      if (!notification.is_read) {
        markReadMutation.mutate(notification.id);
      }
      // Navigate based on notification type
      if (notification.related_violation) {
        router.push(`/violations/${notification.related_violation}`);
      }
    },
    [markReadMutation, router]
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'VIOLATION':
        return { name: 'warning', color: '#EF4444' };
      case 'PATROL':
        return { name: 'car', color: '#3B82F6' };
      case 'SYSTEM':
        return { name: 'settings', color: '#6B7280' };
      default:
        return { name: 'notifications', color: '#F59E0B' };
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.notification_type);
    return (
      <TouchableOpacity className="mb-3" onPress={() => handleNotificationPress(item)}>
        <Card
          variant={item.is_read ? 'outlined' : 'elevated'}
          className={!item.is_read ? 'border-l-primary-500 border-l-4' : ''}>
          <View className="flex-row items-start">
            <View
              className="mr-3 h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: icon.color + '20' }}>
              <Ionicons name={icon.name as any} size={20} color={icon.color} />
            </View>
            <View className="flex-1">
              <Text
                className={`font-semibold ${!item.is_read ? 'font-bold' : ''}`}
                style={{ color: colors.text }}>
                {item.title}
              </Text>
              <Text style={{ color: colors.textSecondary }} numberOfLines={2}>
                {item.body}
              </Text>
              <Text className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </Text>
            </View>
            {!item.is_read && <View className="bg-primary-500 h-3 w-3 rounded-full" />}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderViolation = ({ item }: { item: any }) => (
    <TouchableOpacity className="mb-3" onPress={() => router.push(`/violations/${item.id}`)}>
      <Card variant="elevated">
        <View className="flex-row items-center">
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <Ionicons name="warning" size={24} color="#EF4444" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                {item.detection?.license_plate}
              </Text>
              <Badge label={item.violation_type} variant="error" size="sm" className="ml-2" />
            </View>
            <Text style={{ color: colors.textSecondary }}>
              {item.recorded_speed && `${item.recorded_speed} km/h • `}
              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  const unreadCount = notifications?.results?.filter((n) => !n.is_read).length || 0;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? colors.background : '#F9FAFB' }}>
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Alerts
        </Text>
      </View>

      {/* Tabs */}
      <View className="mb-4 flex-row px-4">
        <TouchableOpacity
          className={`flex-1 items-center rounded-l-xl py-3 ${
            activeTab === 'notifications' ? 'bg-primary-500' : 'bg-gray-100 dark:bg-gray-800'
          }`}
          onPress={() => setActiveTab('notifications')}>
          <View className="flex-row items-center">
            <Ionicons
              name="notifications"
              size={20}
              color={activeTab === 'notifications' ? '#FFFFFF' : colors.text}
            />
            <Text
              className={`ml-2 font-medium ${activeTab === 'notifications' ? 'text-white' : ''}`}
              style={activeTab !== 'notifications' ? { color: colors.text } : undefined}>
              Notifications
            </Text>
            {unreadCount > 0 && (
              <View className="ml-2 h-5 w-5 items-center justify-center rounded-full bg-red-500">
                <Text className="text-xs font-bold text-white">{unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 items-center rounded-r-xl py-3 ${
            activeTab === 'violations' ? 'bg-primary-500' : 'bg-gray-100 dark:bg-gray-800'
          }`}
          onPress={() => setActiveTab('violations')}>
          <View className="flex-row items-center">
            <Ionicons
              name="warning"
              size={20}
              color={activeTab === 'violations' ? '#FFFFFF' : colors.text}
            />
            <Text
              className={`ml-2 font-medium ${activeTab === 'violations' ? 'text-white' : ''}`}
              style={activeTab !== 'violations' ? { color: colors.text } : undefined}>
              Violations
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Mark All Read Button */}
      {activeTab === 'notifications' && unreadCount > 0 && (
        <TouchableOpacity
          className="mx-4 mb-3 flex-row items-center justify-end"
          onPress={() => markAllReadMutation.mutate()}>
          <Ionicons name="checkmark-done" size={18} color={colors.primary} />
          <Text className="text-primary-500 ml-1">Mark all as read</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      {activeTab === 'notifications' ? (
        <FlatList
          data={notifications?.results || []}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={notificationsLoading}
              onRefresh={refetchNotifications}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="notifications-off-outline" size={64} color={colors.textSecondary} />
              <Text className="mt-4 text-lg" style={{ color: colors.textSecondary }}>
                No notifications
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={violations?.results || []}
          renderItem={renderViolation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={violationsLoading}
              onRefresh={refetchViolations}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View className="items-center py-16">
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              <Text className="mt-4 text-lg" style={{ color: colors.textSecondary }}>
                No violations
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

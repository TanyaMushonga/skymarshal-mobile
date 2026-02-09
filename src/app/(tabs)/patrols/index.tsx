import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { Card, Badge, Button } from '@/components/ui';
import { patrolsApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import type { Patrol, PatrolStatus } from '@/types/api';

const statusColors: Record<PatrolStatus, string> = {
  ACTIVE: 'success',
  COMPLETED: 'primary',
  CANCELLED: 'error',
};

export default function PatrolsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<PatrolStatus | 'ALL'>('ALL');

  const {
    data: patrols,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['patrols', filter, user?.email],
    queryFn: () =>
      patrolsApi.list({
        ...(filter !== 'ALL' && { status: filter }),
        officer__email: user?.email,
        limit: 50,
      }),
    enabled: !!user?.email,
  });

  const filters: { label: string; value: PatrolStatus | 'ALL' }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--:--';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const renderPatrol = ({ item }: { item: Patrol }) => (
    <TouchableOpacity
      className="mb-3"
      onPress={() =>
        item.status === 'ACTIVE'
          ? router.push('/(tabs)/patrols/active')
          : router.push(`/(tabs)/patrols/${item.id}`)
      }>
      <Card variant="elevated">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="bg-primary-100 dark:bg-primary-900/30 mr-3 h-10 w-10 items-center justify-center rounded-full">
              <Ionicons name="car" size={20} color="#F59E0B" />
            </View>
            <View>
              <Text className="font-bold" style={{ color: colors.text }}>
                Patrol #{item.id.slice(0, 8)}
              </Text>
              <Text style={{ color: colors.textSecondary }}>
                {format(new Date(item.started_at), 'MMM d, yyyy • HH:mm')}
              </Text>
            </View>
          </View>
          <Badge label={item.status} variant={statusColors[item.status] as any} />
        </View>

        <View className="flex-row">
          <View className="flex-1">
            <Text style={{ color: colors.textSecondary }}>Drone</Text>
            <Text className="font-semibold" style={{ color: colors.text }}>
              {item.drone?.name || 'N/A'}
            </Text>
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.textSecondary }}>Duration</Text>
            <Text className="font-semibold" style={{ color: colors.text }}>
              {formatDuration(item.duration)}
            </Text>
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.textSecondary }}>Detections</Text>
            <Text className="font-semibold" style={{ color: colors.text }}>
              {item.detection_count}
            </Text>
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.textSecondary }}>Violations</Text>
            <Text className="font-semibold text-red-500">{item.violation_count}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? colors.background : '#F9FAFB' }}>
      <View className="px-4 py-4">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          My Patrols
        </Text>
      </View>

      {/* Filter Chips */}
      <View className="mb-4 flex-row px-4">
        {filters.map((f) => (
          <TouchableOpacity
            key={f.value}
            className={`mr-2 rounded-full px-4 py-2 ${
              filter === f.value ? 'bg-primary-500' : 'bg-gray-100 dark:bg-gray-800'
            }`}
            onPress={() => setFilter(f.value)}>
            <Text
              className={`font-medium ${filter === f.value ? 'text-white' : ''}`}
              style={filter !== f.value ? { color: colors.text } : undefined}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={patrols?.results || []}
        renderItem={renderPatrol}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="car-outline" size={64} color={colors.textSecondary} />
            <Text className="mt-4 text-lg" style={{ color: colors.textSecondary }}>
              No patrols found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

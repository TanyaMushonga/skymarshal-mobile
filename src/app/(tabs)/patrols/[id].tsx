import React from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { Card, Badge } from '@/components/ui';
import { patrolsApi, violationsApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';

export default function PatrolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const { data: patrol, isLoading } = useQuery({
    queryKey: ['patrol', id],
    queryFn: () => patrolsApi.get(id),
    enabled: !!id,
  });

  const { data: violations } = useQuery({
    queryKey: ['violations', 'patrol', id],
    queryFn: () => violationsApi.list({ patrol: id, limit: 20 }),
    enabled: !!id,
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--:--';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: isDark ? colors.surface : '#FFFFFF' },
          headerTintColor: colors.text,
          title: `Patrol #${id?.slice(0, 8)}`,
        }}
      />
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: isDark ? colors.background : '#F9FAFB' }}
        contentContainerStyle={{ padding: 16 }}>
        {/* Status Header */}
        <Card variant="elevated" className="mb-4">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                Patrol Details
              </Text>
              <Text style={{ color: colors.textSecondary }}>
                {patrol?.started_at && format(new Date(patrol.started_at), 'PPpp')}
              </Text>
            </View>
            <Badge
              label={patrol?.status || 'UNKNOWN'}
              variant={patrol?.status === 'COMPLETED' ? 'success' : 'primary'}
            />
          </View>

          <View className="flex-row flex-wrap">
            <View className="mb-4 w-1/2">
              <Text style={{ color: colors.textSecondary }}>Drone</Text>
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                {patrol?.drone?.name || 'N/A'}
              </Text>
            </View>
            <View className="mb-4 w-1/2">
              <Text style={{ color: colors.textSecondary }}>Duration</Text>
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                {formatDuration(patrol?.duration)}
              </Text>
            </View>
            <View className="w-1/2">
              <Text style={{ color: colors.textSecondary }}>Detections</Text>
              <Text className="text-lg font-semibold text-blue-500">
                {patrol?.detection_count || 0}
              </Text>
            </View>
            <View className="w-1/2">
              <Text style={{ color: colors.textSecondary }}>Violations</Text>
              <Text className="text-lg font-semibold text-red-500">
                {patrol?.violation_count || 0}
              </Text>
            </View>
          </View>
        </Card>

        {/* Violations */}
        <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>
          Violations ({violations?.count || 0})
        </Text>

        {violations?.results?.map((violation) => (
          <TouchableOpacity
            key={violation.id}
            onPress={() => router.push(`/violations/${violation.id}`)}>
            <Card variant="outlined" className="mb-3">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <Ionicons name="warning" size={20} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold" style={{ color: colors.text }}>
                    {violation.detection?.license_plate} - {violation.violation_type}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {format(new Date(violation.timestamp), 'HH:mm:ss')}
                    {violation.recorded_speed && ` • ${violation.recorded_speed} km/h`}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {!violations?.results?.length && (
          <View className="items-center py-8">
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            <Text className="mt-2" style={{ color: colors.textSecondary }}>
              No violations recorded
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

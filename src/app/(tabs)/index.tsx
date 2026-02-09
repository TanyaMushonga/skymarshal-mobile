import React, { useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';

import { Card, Badge, Button } from '@/components/ui';
import { StartPatrolSheet } from '@/components/sheets/StartPatrolSheet';
import { EndPatrolSheet } from '@/components/sheets/EndPatrolSheet';
import { analyticsApi, violationsApi, patrolsApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import { usePatrolStore } from '@/stores/patrolStore';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const { activePatrol, isPatrolling } = usePatrolStore();
  const startPatrolRef = useRef<BottomSheet>(null);
  const endPatrolRef = useRef<BottomSheet>(null);

  const {
    data: dashboard,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: analyticsApi.getDashboard,
    refetchInterval: 30000,
  });

  const { data: violations } = useQuery({
    queryKey: ['violations', 'recent'],
    queryFn: () => violationsApi.list({ limit: 5 }),
  });

  const { data: currentPatrol, refetch: refetchPatrol } = useQuery({
    queryKey: ['activePatrol', user?.email],
    queryFn: () => patrolsApi.getActive(user?.email || ''),
    enabled: !!user?.email,
  });

  const handleStartPatrol = useCallback(() => {
    startPatrolRef.current?.expand();
  }, []);

  const handleEndPatrol = useCallback(() => {
    endPatrolRef.current?.expand();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? colors.background : '#F9FAFB' }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              refetch();
              refetchPatrol();
            }}
            tintColor={colors.primary}
          />
        }>
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>
              {getGreeting()}, Officer
            </Text>
            <Text style={{ color: colors.textSecondary }}>
              {user?.first_name} {user?.last_name}
            </Text>
            <View className="mt-1 flex-row items-center">
              <Text style={{ color: colors.textSecondary }}>Force #: {user?.force_number}</Text>
              <View className="mx-2 h-1 w-1 rounded-full bg-gray-400" />
              <Badge
                label={user?.is_on_duty ? 'On Duty' : 'Off Duty'}
                variant={user?.is_on_duty ? 'success' : 'default'}
                dot
              />
            </View>
          </View>
          <TouchableOpacity
            className="relative rounded-full bg-white p-3 dark:bg-gray-800"
            onPress={() => router.push('/(tabs)/alerts')}>
            <Ionicons name="notifications" size={24} color={colors.text} />
            <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-red-500">
              <Text className="text-xs font-bold text-white">3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Active Patrol Card */}
        {(currentPatrol || isPatrolling) && (
          <Card variant="elevated" className="border-l-primary-500 mb-4 border-l-4">
            <View className="mb-3 flex-row items-center">
              <View className="bg-primary-100 mr-3 h-10 w-10 items-center justify-center rounded-full">
                <Ionicons name="car" size={20} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold" style={{ color: colors.text }}>
                  ACTIVE PATROL
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  Drone: {currentPatrol?.drone?.name || 'DR-001'}
                </Text>
              </View>
              <Badge label="LIVE" variant="success" dot />
            </View>

            <View className="mb-4 flex-row">
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                  02:34:12
                </Text>
                <Text style={{ color: colors.textSecondary }}>Duration</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                  {currentPatrol?.detection_count || 45}
                </Text>
                <Text style={{ color: colors.textSecondary }}>Detections</Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                  {currentPatrol?.violation_count || 3}
                </Text>
                <Text style={{ color: colors.textSecondary }}>Violations</Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <Button
                title="End Patrol"
                variant="danger"
                className="flex-1"
                onPress={handleEndPatrol}
              />
              <Button
                title="View Details"
                variant="outline"
                className="flex-1"
                onPress={() => router.push('/(tabs)/patrols/active')}
              />
            </View>
          </Card>
        )}

        {/* Today's Stats */}
        <Card variant="elevated" className="mb-4">
          <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>
            📊 Today's Stats
          </Text>
          <View className="flex-row">
            <View className="bg-primary-50 dark:bg-primary-900/20 flex-1 items-center rounded-xl p-4">
              <Text className="text-primary-600 text-3xl font-bold">
                {dashboard?.today_patrols || 0}
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Patrols
              </Text>
            </View>
            <View className="w-3" />
            <View className="flex-1 items-center rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
              <Text className="text-3xl font-bold text-blue-600">
                {dashboard?.today_detections || 0}
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Detections
              </Text>
            </View>
            <View className="w-3" />
            <View className="flex-1 items-center rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
              <Text className="text-3xl font-bold text-red-600">
                {dashboard?.today_violations || 0}
              </Text>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                Violations
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <Card variant="elevated" className="mb-4">
          <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>
            ⚡ Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="bg-primary-500 flex-1 items-center rounded-xl p-4"
              onPress={handleStartPatrol}
              disabled={isPatrolling}>
              <Ionicons name="play" size={24} color="#FFFFFF" />
              <Text className="mt-2 font-semibold text-white">
                {isPatrolling ? 'Patrolling' : 'Start Patrol'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 items-center rounded-xl bg-gray-100 p-4 dark:bg-gray-800"
              onPress={() => {}}>
              <Ionicons name="warning" size={24} color={colors.text} />
              <Text className="mt-2 font-semibold" style={{ color: colors.text }}>
                Report Issue
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 items-center rounded-xl bg-red-500 p-4"
              onPress={() => {}}>
              <Ionicons name="alert-circle" size={24} color="#FFFFFF" />
              <Text className="mt-2 font-semibold text-white">SOS</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Recent Violations */}
        <Card variant="elevated">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              🚨 Recent Violations
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/alerts')}>
              <Text className="text-primary-500">View All</Text>
            </TouchableOpacity>
          </View>

          {violations?.results?.length ? (
            violations.results.map((violation) => (
              <TouchableOpacity
                key={violation.id}
                className="flex-row items-center border-b border-gray-100 py-3 dark:border-gray-800"
                onPress={() => router.push(`/violations/${violation.id}`)}>
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <Ionicons name="warning" size={20} color="#EF4444" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold" style={{ color: colors.text }}>
                    {violation.detection?.license_plate} - {violation.violation_type}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {violation.recorded_speed && `${violation.recorded_speed} km/h · `}
                    {formatDistanceToNow(new Date(violation.timestamp), { addSuffix: true })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center py-8">
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              <Text className="mt-2" style={{ color: colors.textSecondary }}>
                No recent violations
              </Text>
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Bottom Sheets */}
      <StartPatrolSheet ref={startPatrolRef} />
      <EndPatrolSheet ref={endPatrolRef} patrol={currentPatrol} />
    </SafeAreaView>
  );
}

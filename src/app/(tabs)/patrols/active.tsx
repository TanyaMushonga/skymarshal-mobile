import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';

import { Card, Badge, Button } from '@/components/ui';
import { EndPatrolSheet } from '@/components/sheets/EndPatrolSheet';
import { patrolsApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { safeParseDate } from '@/lib/dateUtils';

export default function ActivePatrolScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const endPatrolRef = useRef<BottomSheet>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const { data: patrol } = useQuery({
    queryKey: ['activePatrol', user?.email],
    queryFn: () => patrolsApi.getActive(user?.email || ''),
    enabled: !!user?.email,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (!patrol) return;
    const parsedStart = safeParseDate(patrol.started_at);
    if (!parsedStart) return;
    const startTime = parsedStart.getTime();
    const updateElapsed = () => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [patrol]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndPatrol = useCallback(() => {
    endPatrolRef.current?.expand();
  }, []);

  if (!patrol) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}>
        <Ionicons name="car-outline" size={64} color={colors.textSecondary} />
        <Text className="mt-4 text-lg" style={{ color: colors.textSecondary }}>
          No active patrol
        </Text>
        <Button title="Go Back" variant="outline" className="mt-4" onPress={() => router.back()} />
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
          title: 'Active Patrol',
        }}
      />
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: isDark ? colors.background : '#F9FAFB' }}
        contentContainerStyle={{ padding: 16 }}>
        {/* Live Stats */}
        <Card
          variant="elevated"
          className="mb-4"
          style={
            isDark
              ? {
                  borderLeftWidth: 4,
                  borderLeftColor: '#10B981',
                  backgroundColor: '#0A0A0A',
                  borderColor: '#1A1A1A',
                  borderWidth: 1,
                }
              : { borderLeftWidth: 4, borderLeftColor: '#10B981' }
          }>
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Ionicons name="radio" size={24} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                PATROL IN PROGRESS
              </Text>
              <Text style={{ color: colors.textSecondary }}>Drone: {patrol.drone?.name}</Text>
            </View>
            <Badge label="LIVE" variant="success" dot />
          </View>

          <View className="mb-4 items-center rounded-xl bg-gray-50 py-6 dark:bg-gray-800">
            <Text style={{ color: colors.textSecondary }}>Duration</Text>
            <Text className="text-5xl font-bold" style={{ color: colors.text }}>
              {formatDuration(elapsedSeconds)}
            </Text>
          </View>

          <View className="flex-row">
            <View
              className="flex-1 items-center rounded-xl p-4"
              style={{ backgroundColor: isDark ? '#F59E0B10' : '#FEF3C7' }}>
              <Ionicons name="eye-outline" size={24} color={colors.primary} />
              <Text className="mt-1 text-3xl font-black" style={{ color: colors.primary }}>
                {patrol.detection_count || 0}
              </Text>
              <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Detections</Text>
            </View>
            <View className="w-4" />
            <View className="flex-1 items-center rounded-xl bg-red-50 p-4 dark:bg-red-900/10">
              <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
              <Text className="mt-1 text-3xl font-black text-red-600">
                {patrol.violation_count || 0}
              </Text>
              <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Violations</Text>
            </View>
          </View>
        </Card>

        {/* Drone Telemetry */}
        <Card
          variant="elevated"
          className="mb-4"
          style={
            isDark ? { backgroundColor: '#0A0A0A', borderColor: '#1A1A1A', borderWidth: 1 } : {}
          }>
          <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>
            Drone Status
          </Text>
          <View className="flex-row flex-wrap">
            <View className="mb-4 w-1/2">
              <Text style={{ color: colors.textSecondary }}>Battery</Text>
              <View className="flex-row items-center">
                <Ionicons
                  name={
                    (patrol.drone?.status?.battery_level || 0) > 50
                      ? 'battery-full-outline'
                      : 'battery-dead-outline'
                  }
                  size={20}
                  color={(patrol.drone?.status?.battery_level || 0) > 20 ? '#10B981' : '#EF4444'}
                />
                <Text className="ml-2 text-lg font-bold" style={{ color: colors.text }}>
                  {patrol.drone?.status?.battery_level || '--'}%
                </Text>
              </View>
            </View>
            <View className="mb-4 w-1/2">
              <Text style={{ color: colors.textSecondary }}>Signal</Text>
              <View className="flex-row items-center">
                <Ionicons name="wifi" size={20} color="#10B981" />
                <Text className="ml-2 text-lg font-semibold" style={{ color: colors.text }}>
                  {patrol.drone?.status?.signal_strength || '--'}%
                </Text>
              </View>
            </View>
            <View className="w-1/2">
              <Text style={{ color: colors.textSecondary }}>Altitude</Text>
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                {patrol.drone?.altitude || '--'} m
              </Text>
            </View>
            <View className="w-1/2">
              <Text style={{ color: colors.textSecondary }}>Speed</Text>
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                {patrol.drone?.speed || '--'} km/h
              </Text>
            </View>
          </View>
        </Card>

        {/* End Patrol Button */}
        <Button
          title="End Patrol"
          variant="danger"
          size="lg"
          onPress={handleEndPatrol}
          icon={<Ionicons name="stop-circle-outline" size={24} color="#FFFFFF" />}
        />
      </ScrollView>

      <EndPatrolSheet ref={endPatrolRef} patrol={patrol} />
    </>
  );
}

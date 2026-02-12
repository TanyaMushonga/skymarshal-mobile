import React, { useRef, useCallback, useEffect } from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import BottomSheet from '@gorhom/bottom-sheet';

import {
  MissionControlHero,
  TodayPerformanceGrid,
  IncidentFeed,
  MyAnalytics,
} from '@/components/dashboard';
import { StartPatrolSheet } from '@/components/sheets/StartPatrolSheet';
import { EndPatrolSheet } from '@/components/sheets/EndPatrolSheet';
import { analyticsApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
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

  const { data: myStats } = useQuery({
    queryKey: ['my-stats'],
    queryFn: analyticsApi.getMyStats,
    enabled: !!user,
  });

  // Haptic feedback logic
  const prevViolations = useRef(dashboard?.today_stats?.violations);
  useEffect(() => {
    if (
      dashboard?.today_stats?.violations !== undefined &&
      prevViolations.current !== undefined &&
      dashboard.today_stats.violations > prevViolations.current
    ) {
      // Note: ReactNativeHapticFeedback is requested but not in package.json
      // In a real environment, we would use:
      // ReactNativeHapticFeedback.trigger("impactHeavy");
      console.log('[Haptics] Violation count increased! Triggering Impact: Heavy');
    }
    prevViolations.current = dashboard?.today_stats?.violations;
  }, [dashboard?.today_stats?.violations]);

  const handleEndPatrol = useCallback(() => {
    endPatrolRef.current?.expand();
  }, []);

  return (
    <View className="flex-1" style={{ backgroundColor: isDark ? colors.background : '#F9FAFB' }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {
              refetch();
            }}
            tintColor={colors.primary}
          />
        }>
        {/* Mission Control Hero (Active Patrol) */}
        {dashboard?.active_patrol && (
          <MissionControlHero
            activePatrol={dashboard.active_patrol}
            onEndPatrol={handleEndPatrol}
          />
        )}

        {/* Today's Performance Grid */}
        {dashboard?.today_stats && <TodayPerformanceGrid stats={dashboard.today_stats} />}

        {/* Analytics */}
        <MyAnalytics stats={myStats} />

        {/* Incident Feed */}
        {dashboard?.recent_alerts && <IncidentFeed alerts={dashboard.recent_alerts} />}
      </ScrollView>

      {/* Bottom Sheets */}
      <StartPatrolSheet ref={startPatrolRef} />
      <EndPatrolSheet ref={endPatrolRef} patrol={dashboard?.active_patrol as any} />
    </View>
  );
}

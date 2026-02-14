import React, { useRef, useCallback, useEffect, useState } from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import {
  MissionControlHero,
  TodayPerformanceGrid,
  IncidentFeed,
  MyAnalytics,
  StartPatrolCTA,
} from '@/components/dashboard';
import { StartPatrolModal } from '@/components/modals/StartPatrolModal';
import { EndPatrolModal } from '@/components/modals/EndPatrolModal';
import { TelemetryModal } from '@/components/modals/TelemetryModal';
import { ViolationDetailModal } from '@/components/modals/ViolationDetailModal';
import { DetectionDetailModal } from '@/components/modals/DetectionDetailModal';
import { analyticsApi } from '@/api';
import type { DashboardStats } from '@/types/api';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const [isStartModalVisible, setIsStartModalVisible] = useState(false);
  const [isEndModalVisible, setIsEndModalVisible] = useState(false);

  const {
    data: dashboard,
    isLoading,
    refetch,
  } = useQuery<DashboardStats>({
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
    console.log('[Dashboard] Opening EndPatrolModal for patrol:', dashboard?.active_patrol?.id);
    setIsEndModalVisible(true);
  }, [dashboard?.active_patrol]);

  const handleStartPatrol = useCallback(() => {
    setIsStartModalVisible(true);
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
        {dashboard?.active_patrol ? (
          <MissionControlHero
            activePatrol={dashboard.active_patrol}
            onEndPatrol={handleEndPatrol}
          />
        ) : (
          <StartPatrolCTA onStart={handleStartPatrol} />
        )}

        {/* Today's Performance Grid */}
        {dashboard?.today_stats && <TodayPerformanceGrid stats={dashboard.today_stats} />}

        {/* Analytics */}
        <MyAnalytics stats={myStats} />

        {/* Incident Feed */}
        {dashboard?.recent_alerts && <IncidentFeed alerts={dashboard.recent_alerts} />}
      </ScrollView>

      {/* Modals */}
      <StartPatrolModal
        visible={isStartModalVisible}
        onClose={() => setIsStartModalVisible(false)}
      />
      <EndPatrolModal
        visible={isEndModalVisible}
        onClose={() => setIsEndModalVisible(false)}
        patrol={dashboard?.active_patrol}
      />
      <ViolationDetailModal />
      <DetectionDetailModal />
      <TelemetryModal />
    </View>
  );
}

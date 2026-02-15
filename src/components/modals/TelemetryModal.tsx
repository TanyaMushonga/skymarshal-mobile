import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { safeFormatSnapshot } from '@/lib/dateUtils';

import { BaseModal } from '../ui/BaseModal';
import { Card, Badge } from '@/components/ui';
import { patrolsApi, violationsApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useUIStore } from '@/stores/uiStore';
import { usePatrolStore } from '@/stores/patrolStore';
import { useAuthStore } from '@/stores/authStore';

export const TelemetryModal: React.FC = () => {
  const { telemetryPatrolId, closeDetail, openViolationDetail } = useUIStore();
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const { activePatrol } = usePatrolStore();

  const { data: patrol, isLoading } = useQuery({
    queryKey: ['patrol', telemetryPatrolId || 'active'],
    queryFn: () =>
      telemetryPatrolId && telemetryPatrolId !== 'active'
        ? patrolsApi.get(telemetryPatrolId)
        : patrolsApi.getActive(user?.email || ''),
    enabled: !!telemetryPatrolId || !!user?.email,
    initialData:
      telemetryPatrolId && activePatrol?.id === telemetryPatrolId ? activePatrol : undefined,
    refetchInterval: telemetryPatrolId ? 5000 : false, // Poll for live updates if active
  });

  const { data: violations } = useQuery({
    queryKey: ['violations', 'patrol', telemetryPatrolId],
    queryFn: () => violationsApi.list({ patrol: telemetryPatrolId!, limit: 20 }),
    enabled: !!telemetryPatrolId,
  });

  const formatDuration = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return '--:--:--';
    const hrs = Math.floor(Math.abs(seconds) / 3600);
    const mins = Math.floor((Math.abs(seconds) % 3600) / 60);
    const secs = Math.abs(seconds) % 60;
    const prefix = seconds < 0 ? '-' : '';
    return `${prefix}${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <BaseModal visible={!!telemetryPatrolId} onClose={closeDetail} title="Live Telemetry">
      {isLoading ? (
        <View className="flex-1 items-center justify-center p-10">
          <Text style={{ color: colors.textSecondary }}>Initializing telemetry link...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* ── Summary stat panel (dark) ────────────────────────────────── */}
          <View style={{ backgroundColor: isDark ? '#0A0A0A' : '#0F172A' }}>
            {/* Title row */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.06)',
              }}>
              <View>
                <Text
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 11,
                    fontWeight: '600',
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                  }}>
                  {(patrol as any)?.drone_id_str ||
                    patrol?.drone?.name ||
                    patrol?.drone_id ||
                    'Drone Unit'}
                </Text>
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 2 }}>
                  {safeFormatSnapshot(
                    patrol?.start_time || patrol?.started_at,
                    'MMM d, yyyy · HH:mm'
                  )}
                </Text>
              </View>
              <Badge
                label={patrol?.status || 'UNKNOWN'}
                variant={patrol?.status === 'ACTIVE' ? 'success' : 'primary'}
              />
            </View>

            {/* Duration */}
            <View
              style={{
                alignItems: 'center',
                paddingVertical: 24,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.06)',
              }}>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 44,
                  fontWeight: '700',
                  letterSpacing: -1.5,
                  lineHeight: 48,
                  fontVariant: ['tabular-nums'],
                }}>
                {formatDuration(
                  patrol?.flight_duration_seconds !== undefined
                    ? patrol?.flight_duration_seconds
                    : (patrol as any)?.duration
                )}
              </Text>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: 11,
                  fontWeight: '500',
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  marginTop: 6,
                }}>
                Patrol Time
              </Text>
            </View>

            {/* Counts */}
            <View style={{ flexDirection: 'row' }}>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 18,
                  borderRightWidth: 1,
                  borderRightColor: 'rgba(255,255,255,0.06)',
                }}>
                <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '700' }}>
                  {patrol?.detection_count || 0}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '600' }}>
                  DETECTIONS
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center', paddingVertical: 18 }}>
                <Text
                  style={{
                    color: (patrol?.violation_count || 0) > 0 ? '#EF4444' : '#FFFFFF',
                    fontSize: 24,
                    fontWeight: '700',
                  }}>
                  {patrol?.violation_count || 0}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '600' }}>
                  VIOLATIONS
                </Text>
              </View>
            </View>
          </View>

          {/* Violations List */}
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                fontWeight: '700',
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}>
              Live Violations ({violations?.count || 0})
            </Text>

            {violations?.results?.map((v, i) => (
              <TouchableOpacity
                key={v.id}
                onPress={() => openViolationDetail(v.id)}
                className="mb-3">
                <Card
                  variant="outlined"
                  style={isDark ? { backgroundColor: '#0A0A0A', borderColor: '#1A1A1A' } : {}}>
                  <View className="flex-row items-center p-3">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/10">
                      <Ionicons name="warning-outline" size={20} color="#EF4444" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-lg font-bold" style={{ color: colors.text }}>
                        {(v.detection as any)?.license_plate || (v as any).license_plate || '—'}
                      </Text>
                      <Text className="text-base" style={{ color: colors.textSecondary }}>
                        {v.violation_type} • {safeFormatSnapshot(v.timestamp, 'HH:mm:ss')}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}

            {!violations?.results?.length && (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="shield-checkmark" size={40} color="#10B981" />
                <Text style={{ color: colors.textSecondary, marginTop: 12 }}>
                  No violations active
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </BaseModal>
  );
};

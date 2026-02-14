import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { safeFormatSnapshot } from '@/lib/dateUtils';

import { BaseModal } from '../ui/BaseModal';
import { Card, Badge, Button } from '@/components/ui';
import { patrolsApi, violationsApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useUIStore } from '@/stores/uiStore';

export const PatrolDetailModal: React.FC = () => {
  const { patrolDetailId, closeDetail, openViolationDetail, openTelemetry } = useUIStore();
  const { colors, isDark } = useTheme();

  const { data: patrol, isLoading } = useQuery({
    queryKey: ['patrol', patrolDetailId],
    queryFn: () => patrolsApi.get(patrolDetailId!),
    enabled: !!patrolDetailId,
  });

  const { data: violations } = useQuery({
    queryKey: ['violations', 'patrol', patrolDetailId],
    queryFn: () => violationsApi.list({ patrol: patrolDetailId!, limit: 20 }),
    enabled: !!patrolDetailId,
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
    <BaseModal visible={!!patrolDetailId} onClose={closeDetail} title="Patrol Details">
      {isLoading ? (
        <View className="flex-1 items-center justify-center p-10">
          <Text style={{ color: colors.textSecondary }}>Loading patrol details...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Header Info */}
          <Card
            variant="elevated"
            className="mb-4"
            style={
              isDark ? { backgroundColor: '#0A0A0A', borderColor: '#1A1A1A', borderWidth: 1 } : {}
            }>
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-lg font-bold" style={{ color: colors.text }}>
                  Patrol #{(patrol as any)?.drone_id_str || patrol?.id?.slice(0, 8).toUpperCase()}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  {safeFormatSnapshot(patrol?.start_time || patrol?.started_at)}
                </Text>
              </View>
              <Badge
                label={patrol?.status || 'UNKNOWN'}
                variant={patrol?.status === 'COMPLETED' ? 'success' : 'primary'}
              />
            </View>

            <View className="flex-row flex-wrap">
              <View className="mb-4 w-1/2">
                <Text className="text-xs" style={{ color: colors.textSecondary }}>
                  Drone
                </Text>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  {(patrol as any)?.drone_id_str ||
                    patrol?.drone?.name ||
                    patrol?.drone_id ||
                    'N/A'}
                </Text>
              </View>
              <View className="mb-4 w-1/2">
                <Text className="text-xs" style={{ color: colors.textSecondary }}>
                  Duration
                </Text>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  {formatDuration(
                    patrol?.flight_duration_seconds !== undefined
                      ? patrol?.flight_duration_seconds
                      : (patrol as any)?.duration
                  )}
                </Text>
              </View>
              <View className="w-1/2">
                <Text className="text-xs" style={{ color: colors.textSecondary }}>
                  Detections
                </Text>
                <Text className="text-base font-bold" style={{ color: colors.primary }}>
                  {patrol?.detection_count || 0}
                </Text>
              </View>
              <View className="w-1/2">
                <Text className="text-xs" style={{ color: colors.textSecondary }}>
                  Violations
                </Text>
                <Text className="text-base font-bold text-red-500">
                  {patrol?.violation_count || 0}
                </Text>
              </View>
            </View>
          </Card>

          {/* Violations List */}
          <Text className="mb-3 text-base font-bold" style={{ color: colors.text }}>
            Violations ({violations?.count || 0})
          </Text>

          {violations?.results?.map((violation) => (
            <TouchableOpacity key={violation.id} onPress={() => openViolationDetail(violation.id)}>
              <Card
                variant="outlined"
                className="mb-3"
                style={
                  isDark
                    ? { backgroundColor: '#0A0A0A', borderColor: '#1A1A1A', borderWidth: 1 }
                    : {}
                }>
                <View className="flex-row items-center">
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/10">
                    <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold" style={{ color: colors.text }}>
                      {(violation.detection as any)?.license_plate ||
                        (violation as any).license_plate ||
                        'SPEEDING'}{' '}
                      - {violation.violation_type}
                    </Text>
                    <Text style={{ color: colors.textSecondary }}>
                      {safeFormatSnapshot(violation.timestamp || violation.created_at, 'HH:mm:ss')}
                      {(violation.recorded_speed ||
                        (violation as any).evidence_meta?.violation_speed) &&
                        ` • ${Math.round(violation.recorded_speed || (violation as any).evidence_meta?.violation_speed)} km/h`}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}

          {!violations?.results?.length && (
            <View className="items-center py-8">
              <Ionicons name="checkmark-circle" size={40} color="#10B981" />
              <Text className="mt-2 text-sm" style={{ color: colors.textSecondary }}>
                No violations recorded
              </Text>
            </View>
          )}

          {/* Actions */}
          <View className="mt-4 flex-row gap-3 pb-5">
            <Button
              title="Export Report"
              variant="outline"
              icon={<Ionicons name="download-outline" size={18} color={colors.primary} />}
              className="flex-1"
            />
            {patrol?.status === 'ACTIVE' && (
              <Button
                title="View Full Telemetry"
                variant="primary"
                onPress={() => {
                  openTelemetry(patrol.id);
                }}
                className="flex-1"
              />
            )}
          </View>
        </ScrollView>
      )}
    </BaseModal>
  );
};

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { safeFormatSnapshot } from '@/lib/dateUtils';

import { BaseModal } from '../ui/BaseModal';
import { Card, Badge, Button } from '@/components/ui';
import { violationsApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useUIStore } from '@/stores/uiStore';

export const ViolationDetailModal: React.FC = () => {
  const { violationDetailId, closeDetail } = useUIStore();
  const { colors, isDark } = useTheme();

  const { data: violation, isLoading } = useQuery({
    queryKey: ['violation', violationDetailId],
    queryFn: () => violationsApi.get(violationDetailId!),
    enabled: !!violationDetailId,
  });

  return (
    <BaseModal visible={!!violationDetailId} onClose={closeDetail} title="Violation Details">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.textSecondary }}>Loading...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Evidence Image */}
          {violation?.detection?.image_url && (
            <View className="mb-4 overflow-hidden rounded-2xl">
              <Image
                source={{ uri: violation.detection.image_url }}
                style={{ width: '100%', aspectRatio: 16 / 9 }}
                contentFit="cover"
              />
            </View>
          )}

          {/* Violation Header */}
          <Card
            variant="elevated"
            className="mb-4 border-l-4"
            style={{ borderLeftColor: '#EF4444', padding: 16 }}>
            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                  {(violation?.detection as any)?.license_plate ||
                    (violation as any)?.license_plate ||
                    (violation as any)?.evidence_meta?.license_plate ||
                    'SPEEDING'}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  {safeFormatSnapshot(violation?.timestamp || (violation as any)?.created_at)}
                </Text>
              </View>
              <Badge label={violation?.violation_type || 'SPEEDING'} variant="error" />
            </View>

            {(violation?.recorded_speed || (violation as any)?.evidence_meta?.violation_speed) && (
              <View
                className="items-center rounded-xl p-4"
                style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2' }}>
                <Text style={{ color: colors.textSecondary }}>Recorded Speed</Text>
                <Text className="text-[32px] font-extrabold text-[#EF4444]">
                  {Math.round(
                    violation?.recorded_speed || (violation as any)?.evidence_meta?.violation_speed
                  )}{' '}
                  km/h
                </Text>
                {(violation?.speed_limit || (violation as any)?.evidence_meta?.zone_limit) && (
                  <Text style={{ color: colors.textSecondary }}>
                    Limit: {violation?.speed_limit || (violation as any)?.evidence_meta?.zone_limit}{' '}
                    km/h
                  </Text>
                )}
              </View>
            )}
          </Card>

          {/* Vehicle Info */}
          <Card variant="elevated" className="mb-4 p-4">
            <Text className="mb-3 text-base font-bold" style={{ color: colors.text }}>
              🚗 Vehicle Information
            </Text>
            <View className="flex-row flex-wrap">
              <View className="mb-4 w-1/2">
                <Text className="mb-1 text-xs" style={{ color: colors.textSecondary }}>
                  License Plate
                </Text>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  {(violation?.detection as any)?.license_plate ||
                    (violation as any)?.license_plate ||
                    '—'}
                </Text>
              </View>
              <View className="mb-4 w-1/2">
                <Text className="mb-1 text-xs" style={{ color: colors.textSecondary }}>
                  Vehicle Type
                </Text>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  {(violation?.detection as any)?.vehicle_type || 'Car'}
                </Text>
              </View>
              <View className="mb-4 w-1/2">
                <Text className="mb-1 text-xs" style={{ color: colors.textSecondary }}>
                  Confidence
                </Text>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  {(violation?.detection as any)?.confidence
                    ? `${((violation?.detection as any).confidence * 100).toFixed(1)}%`
                    : 'N/A'}
                </Text>
              </View>
              <View className="mb-4 w-1/2">
                <Text className="mb-1 text-xs" style={{ color: colors.textSecondary }}>
                  Frame Number
                </Text>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  {(violation?.detection as any)?.frame_number || '—'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Location Info */}
          <Card variant="elevated" className="mb-4 p-4">
            <Text className="mb-3 text-base font-bold" style={{ color: colors.text }}>
              📍 GPS Location
            </Text>
            <View className="flex-row flex-wrap">
              <View className="mb-4 w-1/2">
                <Text className="mb-1 text-xs" style={{ color: colors.textSecondary }}>
                  Latitude
                </Text>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  {(
                    violation?.latitude ||
                    (violation as any)?.evidence_meta?.coordinates?.lat ||
                    '—'
                  ).toString()}
                </Text>
              </View>
              <View className="mb-4 w-1/2">
                <Text className="mb-1 text-xs" style={{ color: colors.textSecondary }}>
                  Longitude
                </Text>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  {(
                    violation?.longitude ||
                    (violation as any)?.evidence_meta?.coordinates?.lon ||
                    '—'
                  ).toString()}
                </Text>
              </View>
            </View>
          </Card>

          {/* Evidence Meta */}
          <Card variant="elevated" className="mb-4 p-4">
            <Text className="mb-3 text-base font-bold" style={{ color: colors.text }}>
              📂 Evidence Metadata
            </Text>
            <View className="flex-row flex-wrap">
              <View className="mb-4 w-1/2">
                <Text className="mb-1 text-xs" style={{ color: colors.textSecondary }}>
                  Altitude
                </Text>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  {(violation as any)?.evidence_meta?.altitude
                    ? `${Math.round((violation as any).evidence_meta.altitude)}m`
                    : '—'}
                </Text>
              </View>
              <View className="mb-4 w-1/2">
                <Text className="mb-1 text-xs" style={{ color: colors.textSecondary }}>
                  Patrol ID
                </Text>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  {violation?.patrol?.slice(0, 8).toUpperCase() || '—'}
                </Text>
              </View>
              <View className="w-1/2">
                <Text className="mb-1 text-xs" style={{ color: colors.textSecondary }}>
                  Drone Unit
                </Text>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  {(violation as any)?.evidence_meta?.drone_id || '—'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Actions */}
          <View className="flex-row gap-3 pb-5">
            <Button
              title="Export Report"
              variant="outline"
              icon={<Ionicons name="download-outline" size={20} color="#F59E0B" />}
              className="flex-1"
            />
            <Button
              title="Share"
              variant="secondary"
              icon={<Ionicons name="share-outline" size={20} color="#FFFFFF" />}
              className="flex-1"
            />
          </View>
        </ScrollView>
      )}
    </BaseModal>
  );
};

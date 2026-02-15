import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { safeFormatSnapshot } from '@/lib/dateUtils';

import { BaseModal } from '../ui/BaseModal';
import { Card, Badge } from '@/components/ui';
import { detectionsApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useUIStore } from '@/stores/uiStore';

export const DetectionDetailModal: React.FC = () => {
  const { detectionDetailId, closeDetail } = useUIStore();
  const { colors } = useTheme();

  const { data: detection, isLoading } = useQuery({
    queryKey: ['detection', detectionDetailId],
    queryFn: () => detectionsApi.get(detectionDetailId!),
    enabled: !!detectionDetailId,
  });

  return (
    <BaseModal visible={!!detectionDetailId} onClose={closeDetail} title="Detection Details">
      {isLoading ? (
        <View className="flex-1 items-center justify-center py-10">
          <Text style={{ color: colors.textSecondary }}>Loading...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Image */}
          {detection?.image_url && (
            <View className="mb-4 overflow-hidden rounded-2xl">
              <Image
                source={{ uri: detection.image_url }}
                style={{ width: '100%', aspectRatio: 16 / 9 }}
                contentFit="cover"
              />
            </View>
          )}

          {/* Header Card */}
          <Card variant="elevated" className="mb-4 p-4">
            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text className="text-3xl font-bold" style={{ color: colors.text }}>
                  {detection?.license_plate}
                </Text>
                <Text className="text-lg" style={{ color: colors.textSecondary }}>
                  {safeFormatSnapshot(detection?.timestamp)}
                </Text>
              </View>
              <Badge label={detection?.vehicle_type || 'Vehicle'} variant="info" />
            </View>

            <View className="flex-row flex-wrap">
              <View className="mb-4 w-1/2">
                <Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Confidence
                </Text>
                <Text className="text-lg font-semibold text-green-500">
                  {detection?.confidence ? `${(detection.confidence * 100).toFixed(1)}%` : 'N/A'}
                </Text>
              </View>
              <View className="mb-4 w-1/2">
                <Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Model
                </Text>
                <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                  {detection?.vehicle_model || 'Unknown'}
                </Text>
              </View>
              <View className="mb-4 w-1/2">
                <Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Color
                </Text>
                <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                  {detection?.color || 'Unknown'}
                </Text>
              </View>
              <View className="mb-4 w-1/2">
                <Text className="mb-1 text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Drone
                </Text>
                <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                  {detection?.drone?.name || 'N/A'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Location Card */}
          <Card variant="elevated" className="mb-4 p-4">
            <Text className="mb-3 text-2xl font-bold" style={{ color: colors.text }}>
              Location
            </Text>
            {detection?.gps ? (
              <View>
                <Text className="mb-2 text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Latitude
                </Text>
                <Text className="mb-3 text-lg font-semibold" style={{ color: colors.text }}>
                  {detection.gps.latitude.toFixed(6)}
                </Text>
                <Text className="mb-2 text-sm font-medium" style={{ color: colors.textSecondary }}>
                  Longitude
                </Text>
                <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                  {detection.gps.longitude.toFixed(6)}
                </Text>
              </View>
            ) : (
              <Text style={{ color: colors.textSecondary }}>Location unavailable</Text>
            )}
          </Card>
        </ScrollView>
      )}
    </BaseModal>
  );
};

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { safeFormatSnapshot } from '@/lib/dateUtils';

import { Card, Badge } from '@/components/ui';
import { detectionsApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';

export default function DetectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();

  const { data: detection, isLoading } = useQuery({
    queryKey: ['detection', id],
    queryFn: () => detectionsApi.get(id),
    enabled: !!id,
  });

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
          title: 'Detection Details',
        }}
      />
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: isDark ? colors.background : '#F9FAFB' }}
        contentContainerStyle={{ padding: 16 }}>
        {/* Detection Image */}
        {detection?.image_url && (
          <View className="mb-4 overflow-hidden rounded-2xl">
            <Image
              source={{ uri: detection.image_url }}
              style={{ width: '100%', aspectRatio: 16 / 9 }}
              contentFit="cover"
            />
          </View>
        )}

        {/* Detection Header */}
        <Card variant="elevated" className="mb-4">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                {detection?.license_plate}
              </Text>
              <Text style={{ color: colors.textSecondary }}>
                {safeFormatSnapshot(detection?.timestamp)}
              </Text>
            </View>
            <Badge label={detection?.vehicle_type || 'Vehicle'} variant="info" />
          </View>

          <View className="flex-row flex-wrap">
            <View className="mb-4 w-1/2">
              <Text style={{ color: colors.textSecondary }}>Confidence</Text>
              <Text className="text-lg font-semibold text-green-500">
                {detection?.confidence ? `${(detection.confidence * 100).toFixed(1)}%` : 'N/A'}
              </Text>
            </View>
            <View className="mb-4 w-1/2">
              <Text style={{ color: colors.textSecondary }}>Model</Text>
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                {detection?.vehicle_model || 'Unknown'}
              </Text>
            </View>
            <View className="w-1/2">
              <Text style={{ color: colors.textSecondary }}>Color</Text>
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                {detection?.color || 'Unknown'}
              </Text>
            </View>
            <View className="w-1/2">
              <Text style={{ color: colors.textSecondary }}>Drone</Text>
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                {detection?.drone?.name || 'N/A'}
              </Text>
            </View>
          </View>
        </Card>

        {/* GPS Coordinates */}
        <Card variant="elevated">
          <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>
            📍 Location
          </Text>
          {detection?.gps ? (
            <View>
              <Text style={{ color: colors.text }}>
                Latitude: {detection.gps.latitude.toFixed(6)}
              </Text>
              <Text style={{ color: colors.text }}>
                Longitude: {detection.gps.longitude.toFixed(6)}
              </Text>
            </View>
          ) : (
            <Text style={{ color: colors.textSecondary }}>Location unavailable</Text>
          )}
        </Card>
      </ScrollView>
    </>
  );
}

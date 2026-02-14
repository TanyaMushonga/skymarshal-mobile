import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { safeFormatSnapshot } from '@/lib/dateUtils';

import { Card, Badge, Button } from '@/components/ui';
import { violationsApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';

export default function ViolationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const { data: violation, isLoading } = useQuery({
    queryKey: ['violation', id],
    queryFn: () => violationsApi.get(id),
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
          title: 'Violation Details',
        }}
      />
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: isDark ? colors.background : '#F9FAFB' }}
        contentContainerStyle={{ padding: 16 }}>
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
        <Card variant="elevated" className="mb-4 border-l-4 border-l-red-500">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                {violation?.detection?.license_plate}
              </Text>
              <Text style={{ color: colors.textSecondary }}>
                {safeFormatSnapshot(violation?.timestamp)}
              </Text>
            </View>
            <Badge label={violation?.violation_type || 'SPEEDING'} variant="error" />
          </View>

          {violation?.recorded_speed && (
            <View className="items-center rounded-xl bg-red-50 py-4 dark:bg-red-900/20">
              <Text style={{ color: colors.textSecondary }}>Recorded Speed</Text>
              <Text className="text-4xl font-bold text-red-500">
                {violation?.recorded_speed} km/h
              </Text>
              {violation?.speed_limit && (
                <Text style={{ color: colors.textSecondary }}>
                  Speed Limit: {violation?.speed_limit} km/h
                </Text>
              )}
            </View>
          )}
        </Card>

        {/* Vehicle Details */}
        <Card variant="elevated" className="mb-4">
          <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>
            🚗 Vehicle Information
          </Text>
          <View className="flex-row flex-wrap">
            <View className="mb-4 w-1/2">
              <Text style={{ color: colors.textSecondary }}>License Plate</Text>
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                {violation?.detection?.license_plate}
              </Text>
            </View>
            <View className="mb-4 w-1/2">
              <Text style={{ color: colors.textSecondary }}>Vehicle Type</Text>
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                {violation?.detection?.vehicle_type || 'Car'}
              </Text>
            </View>
            <View className="w-1/2">
              <Text style={{ color: colors.textSecondary }}>Confidence</Text>
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                {violation?.detection?.confidence
                  ? `${(violation?.detection?.confidence * 100).toFixed(1)}%`
                  : 'N/A'}
              </Text>
            </View>
            <View className="w-1/2">
              <Text style={{ color: colors.textSecondary }}>Model</Text>
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                {violation?.detection?.vehicle_model || 'Unknown'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Location */}
        <Card variant="elevated" className="mb-4">
          <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>
            📍 Location
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="location" size={20} color="#EF4444" />
            <Text className="ml-2 flex-1" style={{ color: colors.text }}>
              {violation?.detection?.gps
                ? `${violation?.detection?.gps?.latitude?.toFixed(6)}, ${violation?.detection?.gps?.longitude?.toFixed(6)}`
                : 'Location unavailable'}
            </Text>
          </View>
          <TouchableOpacity
            className="mt-3 flex-row items-center justify-center rounded-xl bg-gray-100 p-3 dark:bg-gray-800"
            onPress={() => router.push('/(tabs)/map')}>
            <Ionicons name="map" size={20} color={colors.primary} />
            <Text className="ml-2 font-medium" style={{ color: colors.primary }}>
              View on Map
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Patrol Info */}
        <Card variant="elevated" className="mb-4">
          <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>
            🚓 Patrol Information
          </Text>
          <View className="flex-row flex-wrap">
            <View className="mb-4 w-1/2">
              <Text style={{ color: colors.textSecondary }}>Patrol ID</Text>
              <TouchableOpacity onPress={() => router.push(`/(tabs)/patrols/${violation?.patrol}`)}>
                <Text className="text-lg font-semibold text-primary-500">
                  #{violation?.patrol?.slice(0, 8)}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="mb-4 w-1/2">
              <Text style={{ color: colors.textSecondary }}>Drone</Text>
              <Text className="text-lg font-semibold" style={{ color: colors.text }}>
                {violation?.detection?.drone?.name || 'N/A'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View className="flex-row gap-3">
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
    </>
  );
}

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { safeFormatSnapshot } from '@/lib/dateUtils';

import { BaseModal } from '../ui/BaseModal';
import { Card, Badge } from '@/components/ui';
import { dronesApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useUIStore } from '@/stores/uiStore';
import { useToast } from '@/hooks/useToast';

export const DroneDetailModal: React.FC = () => {
  const { droneDetailId, closeDetail } = useUIStore();
  const { colors, isDark } = useTheme();
  // const { showToast } = useToast(); // Kept for future use if needed

  const { data: drone, isLoading } = useQuery({
    queryKey: ['drone', droneDetailId],
    queryFn: () => dronesApi.get(droneDetailId!),
    enabled: !!droneDetailId,
  });

  const { data: gpsHistory } = useQuery({
    queryKey: ['drone-gps', droneDetailId],
    queryFn: () => dronesApi.getGPS(droneDetailId!),
    enabled: !!droneDetailId,
  });

  return (
    <BaseModal visible={!!droneDetailId} onClose={closeDetail} title="Drone Details">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: colors.textSecondary }}>Loading...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Header Card */}
          <Card variant="elevated" className="mb-6 p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                  <Ionicons name="airplane" size={24} color="#F59E0B" />
                </View>
                <View>
                  <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                    {drone?.name || 'Unknown Drone'}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>{drone?.model || 'Model N/A'}</Text>
                </View>
              </View>
              <Badge
                label={drone?.status?.status || 'OFFLINE'}
                variant={
                  drone?.status?.status === 'online' || drone?.status?.status === 'in_use'
                    ? 'success'
                    : 'default'
                }
              />
            </View>

            <View className="mt-2 flex-row justify-between">
              <View className="items-center">
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Battery</Text>
                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>
                  {drone?.status?.battery_level ?? '--'}%
                </Text>
              </View>
              <View className="items-center">
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Signal</Text>
                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>
                  {drone?.status?.signal_strength ?? '--'}%
                </Text>
              </View>
              <View className="items-center">
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Speed</Text>
                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16 }}>
                  {drone?.speed ?? '--'} m/s
                </Text>
              </View>
            </View>
          </Card>

          {/* Location Card */}
          <Card variant="elevated" className="mb-6 p-5">
            <Text className="mb-4 text-lg font-bold" style={{ color: colors.text }}>
              Current Location
            </Text>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Latitude</Text>
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {drone?.gps?.latitude?.toFixed(6) ?? '--'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Longitude</Text>
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {drone?.gps?.longitude?.toFixed(6) ?? '--'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Altitude</Text>
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {drone?.altitude?.toFixed(1) ?? '--'} m
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Heading</Text>
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {drone?.heading ?? '--'}°
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Last Update</Text>
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {safeFormatSnapshot(drone?.updated_at)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Additional Info */}
          <Card variant="elevated" className="mb-6 p-5">
            <Text className="mb-4 text-lg font-bold" style={{ color: colors.text }}>
              System Info
            </Text>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Serial Number</Text>
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {drone?.serial_number ?? 'N/A'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Drone ID</Text>
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {drone?.drone_id ?? 'N/A'}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text style={{ color: colors.textSecondary }}>Active Patrol</Text>
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {drone?.current_patrol ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
          </Card>
        </ScrollView>
      )}
    </BaseModal>
  );
};

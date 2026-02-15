import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { BaseModal } from '../ui/BaseModal';
import { Button } from '@/components/ui';
import { dronesApi, patrolsApi, authApi } from '@/api';
import { usePatrolStore } from '@/stores/patrolStore';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/useToast';
import { useUIStore } from '@/stores/uiStore';
import type { Drone, StartPatrolRequest, DashboardStats } from '@/types/api';

interface StartPatrolModalProps {
  visible: boolean;
  onClose: () => void;
}

export const StartPatrolModal: React.FC<StartPatrolModalProps> = ({ visible, onClose }) => {
  const { colors, isDark } = useTheme();
  const queryClient = useQueryClient();
  const { openTelemetry } = useUIStore();
  const { startPatrol } = usePatrolStore();
  const { user, setUser } = useAuthStore();
  const { showToast } = useToast();
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);

  const { data: drones, isLoading } = useQuery({
    queryKey: ['drones', 'available'],
    queryFn: dronesApi.getAvailable,
    enabled: visible,
  });

  const startMutation = useMutation({
    mutationFn: (data: StartPatrolRequest) => patrolsApi.start(data),
    onSuccess: async (patrol) => {
      startPatrol(patrol);

      // Optimistically update dashboard to prevent UI flicker/termination appearance
      queryClient.setQueryData(['dashboard'], (oldData: DashboardStats | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          active_patrol: {
            ...patrol,
            battery_level: selectedDrone?.status?.battery_level || 100,
            flight_duration_seconds: 0,
          },
        };
      });

      if (user && !user.is_on_duty) {
        try {
          const result = await authApi.toggleDuty();
          setUser({ ...user, is_on_duty: result.is_on_duty });
        } catch (error) {
          console.error('[StartPatrolModal] Failed to toggle duty:', error);
        }
      }

      // queryClient.invalidateQueries({ queryKey: ['activePatrol'] });
      // queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();

      openTelemetry(patrol.id);

      showToast('success', 'Patrol Started', 'Your patrol has been initiated successfully.');
    },
    onError: (error: any) => {
      showToast('error', 'Error', error.response?.data?.detail || 'Failed to start patrol');
    },
  });

  const handleStartPatrol = useCallback(() => {
    if (!selectedDrone) {
      showToast('warning', 'Select Drone', 'Please select a drone to start patrol');
      return;
    }
    startMutation.mutate({ drone_id: selectedDrone.drone_id });
  }, [selectedDrone, startMutation, showToast]);

  const renderDrone = ({ item }: { item: Drone }) => {
    const isPatrolling = !!item.is_patrolling;
    const isSelected = !isPatrolling && selectedDrone?.id === item.id;
    const batteryLevel = item.status?.battery_level || 85;
    const batteryColor = batteryLevel > 50 ? '#10B981' : batteryLevel > 20 ? '#F59E0B' : '#EF4444';

    return (
      <TouchableOpacity
        onPress={() => !isPatrolling && setSelectedDrone(item)}
        activeOpacity={isPatrolling ? 1 : 0.7}
        disabled={isPatrolling}>
        <View
          className="mb-2 flex-row items-center rounded-xl border px-3 py-3.5"
          style={{
            backgroundColor: isSelected
              ? isDark
                ? 'rgba(245, 158, 11, 0.1)'
                : 'rgba(245, 158, 11, 0.05)'
              : 'transparent',
            borderColor: isSelected ? colors.primary : 'transparent',
            opacity: isPatrolling ? 0.5 : 1,
          }}>
          <View
            className="mr-3.5 h-5 w-5 items-center justify-center rounded-full border-2"
            style={{
              borderColor: isSelected ? colors.primary : isDark ? '#333' : '#CCC',
              backgroundColor: isSelected ? colors.primary : 'transparent',
            }}>
            {isSelected && <View className="h-2 w-2 rounded-full bg-white" />}
          </View>

          <View
            className="mr-3 h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }}>
            <Ionicons
              name="airplane-outline"
              size={20}
              color={isPatrolling ? colors.textSecondary : colors.primary}
            />
          </View>

          <View className="flex-1">
            <Text className="text-[15px] font-medium leading-5" style={{ color: colors.text }}>
              {item.name}
            </Text>
            <Text className="mt-0.5 text-[13px]" style={{ color: colors.textSecondary }}>
              {item.model} · {item.serial_number}
            </Text>
          </View>

          <View className="items-end gap-1">
            <View
              className="rounded px-2 py-0.5"
              style={{
                backgroundColor: isPatrolling
                  ? isDark
                    ? 'rgba(245, 158, 11, 0.1)'
                    : 'rgba(245, 158, 11, 0.05)'
                  : isDark
                    ? '#0D2A1A'
                    : '#ECFDF5',
              }}>
              <Text
                className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: isPatrolling ? '#F59E0B' : '#10B981' }}>
                {isPatrolling ? 'Patrolling' : 'Available'}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="battery-half-outline" size={13} color={batteryColor} />
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                {batteryLevel}%
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const footer = (
    <Button
      title={
        selectedDrone ? `Initiate Mission with ${selectedDrone.name}` : 'Select a Drone to Start'
      }
      onPress={handleStartPatrol}
      loading={startMutation.isPending}
      disabled={!selectedDrone}
      variant="primary"
    />
  );

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Start New Patrol"
      subtitle="Select an available drone to begin"
      footer={footer}>
      <FlatList
        data={drones || []}
        renderItem={renderDrone}
        keyExtractor={(item: Drone) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Ionicons name="airplane-outline" size={40} color={colors.textSecondary} />
            <Text className="mt-3 text-sm font-medium" style={{ color: colors.textSecondary }}>
              {isLoading ? 'Loading drones…' : 'No drones available'}
            </Text>
          </View>
        }
      />
    </BaseModal>
  );
};

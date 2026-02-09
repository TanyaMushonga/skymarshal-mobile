import React, { forwardRef, useMemo, useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { BaseSheet } from './BaseSheet';
import { Button, Badge } from '@/components/ui';
import { dronesApi, patrolsApi } from '@/api';
import { usePatrolStore } from '@/stores/patrolStore';
import { useTheme } from '@/contexts/ThemeContext';
import type { Drone } from '@/types/api';

export const StartPatrolSheet = forwardRef<BottomSheet>((_, ref) => {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { startPatrol } = usePatrolStore();
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);

  const { data: drones, isLoading } = useQuery({
    queryKey: ['drones', 'available'],
    queryFn: dronesApi.getAvailable,
  });

  const startMutation = useMutation({
    mutationFn: patrolsApi.start,
    onSuccess: (patrol) => {
      startPatrol(patrol);
      queryClient.invalidateQueries({ queryKey: ['activePatrol'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      (ref as React.RefObject<BottomSheet>)?.current?.close();
      Alert.alert('Patrol Started', 'Your patrol has been initiated successfully.');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to start patrol');
    },
  });

  const handleStartPatrol = useCallback(() => {
    if (!selectedDrone) {
      Alert.alert('Select Drone', 'Please select a drone to start patrol');
      return;
    }
    startMutation.mutate({ drone_id: selectedDrone.id });
  }, [selectedDrone, startMutation]);

  const snapPoints = useMemo(() => ['70%'], []);

  const renderDrone = ({ item }: { item: Drone }) => {
    const isSelected = selectedDrone?.id === item.id;
    const isAvailable = !item.current_patrol;

    return (
      <TouchableOpacity
        className={`mb-3 rounded-xl border-2 p-4 ${
          isSelected
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-200 dark:border-gray-700'
        }`}
        onPress={() => isAvailable && setSelectedDrone(item)}
        disabled={!isAvailable}
        style={{ opacity: isAvailable ? 1 : 0.5 }}>
        <View className="flex-row items-center">
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Ionicons name="airplane" size={24} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              🛸 {item.name}
            </Text>
            <Text style={{ color: colors.textSecondary }}>
              {item.model} • {item.serial_number}
            </Text>
          </View>
          <View className="items-end">
            <Badge
              label={isAvailable ? 'Available' : 'In Use'}
              variant={isAvailable ? 'success' : 'warning'}
            />
            <View className="mt-1 flex-row items-center">
              <Ionicons name="battery-half" size={16} color={colors.textSecondary} />
              <Text className="ml-1" style={{ color: colors.textSecondary }}>
                {item.status?.battery_level || 85}%
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BaseSheet ref={ref} title="🚓 Start New Patrol" snapPoints={snapPoints}>
      <View className="flex-1">
        <Text className="mb-3 font-medium" style={{ color: colors.text }}>
          Select a Drone
        </Text>

        <FlatList
          data={drones || []}
          renderItem={renderDrone}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center py-8">
              <Ionicons name="airplane-outline" size={48} color={colors.textSecondary} />
              <Text className="mt-2" style={{ color: colors.textSecondary }}>
                {isLoading ? 'Loading drones...' : 'No drones available'}
              </Text>
            </View>
          }
        />

        <View className="absolute bottom-4 left-0 right-0">
          <Button
            title="🚀 Start Patrol"
            onPress={handleStartPatrol}
            loading={startMutation.isPending}
            disabled={!selectedDrone}
          />
        </View>
      </View>
    </BaseSheet>
  );
});

StartPatrolSheet.displayName = 'StartPatrolSheet';

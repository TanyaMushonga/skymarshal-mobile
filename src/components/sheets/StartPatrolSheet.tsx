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
  const { colors, isDark } = useTheme();
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
  const dividerColor = isDark ? '#1F1F1F' : '#E8E8E8';

  const renderDrone = ({ item, index }: { item: Drone; index: number }) => {
    const isSelected = selectedDrone?.id === item.id;
    const isAvailable = !item.current_patrol;
    const batteryLevel = item.status?.battery_level || 85;

    const batteryColor = batteryLevel > 50 ? '#10B981' : batteryLevel > 20 ? '#F59E0B' : '#EF4444';

    return (
      <TouchableOpacity
        onPress={() => isAvailable && setSelectedDrone(item)}
        disabled={!isAvailable}
        activeOpacity={0.7}
        style={{ opacity: isAvailable ? 1 : 0.4 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 14,
            paddingHorizontal: 4,
            borderBottomWidth: 1,
            borderBottomColor: dividerColor,
          }}>
          {/* Selection indicator */}
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: isSelected ? colors.primary : isDark ? '#333' : '#CCC',
              backgroundColor: isSelected ? colors.primary : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}>
            {isSelected && (
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />
            )}
          </View>

          {/* Drone icon */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}>
            <Ionicons name="airplane-outline" size={20} color={colors.primary} />
          </View>

          {/* Info */}
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '500', lineHeight: 20 }}>
              {item.name}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 1 }}>
              {item.model} · {item.serial_number}
            </Text>
          </View>

          {/* Right meta */}
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 4,
                backgroundColor: isAvailable
                  ? isDark
                    ? '#0D2A1A'
                    : '#ECFDF5'
                  : isDark
                    ? '#2A1A08'
                    : '#FFFBEB',
              }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  letterSpacing: 0.4,
                  color: isAvailable ? '#10B981' : '#F59E0B',
                }}>
                {isAvailable ? 'Available' : 'In Use'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="battery-half-outline" size={13} color={batteryColor} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontVariant: ['tabular-nums'],
                }}>
                {batteryLevel}%
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <BaseSheet ref={ref} title="Start New Patrol" snapPoints={snapPoints}>
      <View style={{ flex: 1 }}>
        {/* Sub-label */}
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: 13,
            marginBottom: 16,
            paddingHorizontal: 4,
          }}>
          Select an available drone to begin
        </Text>

        <FlatList
          data={drones || []}
          renderItem={renderDrone}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Ionicons name="airplane-outline" size={40} color={colors.textSecondary} />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 14,
                  marginTop: 12,
                  fontWeight: '500',
                }}>
                {isLoading ? 'Loading drones…' : 'No drones available'}
              </Text>
            </View>
          }
        />

        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <Button
            title="Start Patrol"
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

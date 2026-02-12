import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { BaseModal } from '../ui/BaseModal';
import { Button } from '@/components/ui';
import { dronesApi, patrolsApi, authApi } from '@/api';
import { usePatrolStore } from '@/stores/patrolStore';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/contexts/ThemeContext';
import type { Drone } from '@/types/api';

interface StartPatrolModalProps {
  visible: boolean;
  onClose: () => void;
}

export const StartPatrolModal: React.FC<StartPatrolModalProps> = ({ visible, onClose }) => {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { startPatrol } = usePatrolStore();
  const { user, setUser } = useAuthStore();
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);

  const { data: drones, isLoading } = useQuery({
    queryKey: ['drones', 'available'],
    queryFn: dronesApi.getAvailable,
    enabled: visible,
  });

  const startMutation = useMutation({
    mutationFn: patrolsApi.start,
    onSuccess: async (patrol) => {
      startPatrol(patrol);

      if (user && !user.is_on_duty) {
        try {
          const result = await authApi.toggleDuty();
          setUser({ ...user, is_on_duty: result.is_on_duty });
        } catch (error) {
          console.error('[StartPatrolModal] Failed to toggle duty:', error);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['activePatrol'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();

      router.push({
        pathname: '/(tabs)/patrols/active',
        params: { id: patrol.id },
      });

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

  const renderDrone = ({ item }: { item: Drone }) => {
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
            paddingHorizontal: 12,
            borderRadius: 12,
            marginBottom: 8,
            backgroundColor: isSelected
              ? isDark
                ? 'rgba(245, 158, 11, 0.1)'
                : 'rgba(245, 158, 11, 0.05)'
              : 'transparent',
            borderWidth: 1,
            borderColor: isSelected ? colors.primary : 'transparent',
          }}>
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

          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: '500', lineHeight: 20 }}>
              {item.name}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 1 }}>
              {item.model} · {item.serial_number}
            </Text>
          </View>

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
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{batteryLevel}%</Text>
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
    </BaseModal>
  );
};

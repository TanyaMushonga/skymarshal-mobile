import React, { forwardRef, useMemo, useCallback } from 'react';
import { View, Text, Alert } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { BaseSheet } from './BaseSheet';
import { Button } from '@/components/ui';
import { patrolsApi } from '@/api';
import { usePatrolStore } from '@/stores/patrolStore';
import { useTheme } from '@/contexts/ThemeContext';
import type { Patrol } from '@/types/api';

interface EndPatrolSheetProps {
  patrol?: Patrol | null;
}

export const EndPatrolSheet = forwardRef<BottomSheet, EndPatrolSheetProps>(({ patrol }, ref) => {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { endPatrol: endPatrolStore } = usePatrolStore();

  const endMutation = useMutation({
    mutationFn: () => patrolsApi.end(patrol?.id || ''),
    onSuccess: () => {
      endPatrolStore();
      queryClient.invalidateQueries({ queryKey: ['activePatrol'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['patrols'] });
      (ref as React.RefObject<BottomSheet>)?.current?.close();
      Alert.alert('Patrol Ended', 'Your patrol has been completed successfully.');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to end patrol');
    },
  });

  const handleEndPatrol = useCallback(() => {
    endMutation.mutate();
  }, [endMutation]);

  const snapPoints = useMemo(() => ['40%'], []);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <BaseSheet ref={ref} title="⚠️ End Patrol" snapPoints={snapPoints}>
      <View className="flex-1">
        <Text className="mb-6 text-center text-lg" style={{ color: colors.textSecondary }}>
          Are you sure you want to end this patrol?
        </Text>

        <View className="mb-6 flex-row justify-around rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
          <View className="items-center">
            <Ionicons name="time" size={24} color={colors.primary} />
            <Text className="mt-1 text-xl font-bold" style={{ color: colors.text }}>
              {formatDuration(patrol?.duration || 0)}
            </Text>
            <Text style={{ color: colors.textSecondary }}>Duration</Text>
          </View>
          <View className="items-center">
            <Ionicons name="eye" size={24} color="#3B82F6" />
            <Text className="mt-1 text-xl font-bold" style={{ color: colors.text }}>
              {patrol?.detection_count || 0}
            </Text>
            <Text style={{ color: colors.textSecondary }}>Detections</Text>
          </View>
          <View className="items-center">
            <Ionicons name="warning" size={24} color="#EF4444" />
            <Text className="mt-1 text-xl font-bold" style={{ color: colors.text }}>
              {patrol?.violation_count || 0}
            </Text>
            <Text style={{ color: colors.textSecondary }}>Violations</Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <Button
            title="Cancel"
            variant="outline"
            className="flex-1"
            onPress={() => (ref as React.RefObject<BottomSheet>)?.current?.close()}
          />
          <Button
            title="🛑 End Patrol"
            variant="danger"
            className="flex-1"
            onPress={handleEndPatrol}
            loading={endMutation.isPending}
          />
        </View>
      </View>
    </BaseSheet>
  );
});

EndPatrolSheet.displayName = 'EndPatrolSheet';

import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { BaseModal } from '../ui/BaseModal';
import { Button } from '@/components/ui';
import { patrolsApi } from '@/api';
import { usePatrolStore } from '@/stores/patrolStore';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/useToast';
import type { Patrol } from '@/types/api';

interface EndPatrolModalProps {
  visible: boolean;
  onClose: () => void;
  patrol: Patrol | undefined;
}

export const EndPatrolModal: React.FC<EndPatrolModalProps> = ({ visible, onClose, patrol }) => {
  const { colors, isDark } = useTheme();
  const queryClient = useQueryClient();
  const { endPatrol } = usePatrolStore();
  const { showToast } = useToast();
  const [notes, setNotes] = useState('');

  const endMutation = useMutation({
    mutationFn: (data: { id: string; notes?: string }) => patrolsApi.end(data.id, data.notes),
    onSuccess: () => {
      endPatrol();
      queryClient.invalidateQueries({ queryKey: ['activePatrol'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['patrols'] });
      onClose();
      setNotes('');
      showToast(
        'success',
        'Patrol Completed',
        'The patrol session has been summarized and closed.'
      );
    },
    onError: (error: any) => {
      showToast('error', 'Error', error.response?.data?.detail || 'Failed to end patrol');
    },
  });

  const handleEndPatrol = () => {
    if (!patrol?.id) return;
    endMutation.mutate({ id: patrol.id, notes });
  };

  if (!patrol) return null;

  const footer = (
    <Button
      title="Complete Mission"
      onPress={handleEndPatrol}
      loading={endMutation.isPending}
      variant="primary"
    />
  );

  const dividerColor = isDark ? '#1F1F1F' : '#E8E8E8';

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title="Complete Mission"
      subtitle="Please review the patrol summary before finalizing the mission."
      footer={footer}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Stats Grid */}
        <View
          className="mb-6 flex-row overflow-hidden rounded-xl border"
          style={{ borderColor: dividerColor }}>
          <View
            className="flex-1 items-center border-r py-4"
            style={{ borderRightColor: dividerColor }}>
            <Text
              className="mb-1 text-[11px] font-bold uppercase tracking-widest"
              style={{ color: colors.textSecondary }}>
              Detections
            </Text>
            <Text className="text-[28px] font-bold" style={{ color: colors.text }}>
              {patrol.detection_count || 0}
            </Text>
          </View>
          <View className="flex-1 items-center py-4">
            <Text
              className="mb-1 text-[11px] font-bold uppercase tracking-widest"
              style={{ color: colors.textSecondary }}>
              Violations
            </Text>
            <Text className="text-[28px] font-bold text-red-500">
              {patrol.violation_count || 0}
            </Text>
          </View>
        </View>

        {/* Drone Info */}
        <View className="flex-row items-center">
          <View
            className="mr-4 h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }}>
            <Ionicons name="airplane-outline" size={20} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold" style={{ color: colors.text }}>
              {patrol.drone?.name || 'Patrol Drone'}
            </Text>
            <Text className="text-[13px]" style={{ color: colors.textSecondary }}>
              {patrol.drone?.model} · {patrol.drone?.serial_number}
            </Text>
          </View>
        </View>

        {/* Notes Input */}
        <Text className="mb-2.5 mt-5 text-sm font-bold" style={{ color: colors.text }}>
          Mission Notes
        </Text>
        <TextInput
          className="min-h-[120px] rounded-xl border p-3.5 text-[15px]"
          style={{
            backgroundColor: isDark ? '#0A0A0A' : '#F9FAFB',
            color: colors.text,
            borderColor: dividerColor,
          }}
          placeholder="Add any observations or issues encountered..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
          textAlignVertical="top"
        />
      </ScrollView>
    </BaseModal>
  );
};

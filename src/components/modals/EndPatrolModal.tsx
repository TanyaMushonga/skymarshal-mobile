import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ScrollView } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { BaseModal } from '../ui/BaseModal';
import { Button } from '@/components/ui';
import { patrolsApi } from '@/api';
import { usePatrolStore } from '@/stores/patrolStore';
import { useTheme } from '@/contexts/ThemeContext';
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
      Alert.alert('Patrol Completed', 'The patrol session has been summarized and closed.');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to end patrol');
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
        <View style={[styles.statsGrid, { borderColor: dividerColor }]}>
          <View style={[styles.statItem, { borderRightWidth: 1, borderRightColor: dividerColor }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Detections</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {patrol.detection_count || 0}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Violations</Text>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>
              {patrol.violation_count || 0}
            </Text>
          </View>
        </View>

        {/* Drone Info */}
        <View style={styles.infoRow}>
          <View style={[styles.iconContainer, { backgroundColor: isDark ? '#1A1A1A' : '#F3F4F6' }]}>
            <Ionicons name="airplane-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
              {patrol.drone?.name || 'Patrol Drone'}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              {patrol.drone?.model} · {patrol.drone?.serial_number}
            </Text>
          </View>
        </View>

        {/* Notes Input */}
        <Text
          style={{
            color: colors.text,
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 10,
            marginTop: 20,
          }}>
          Mission Notes
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: isDark ? '#0A0A0A' : '#F9FAFB',
              color: colors.text,
              borderColor: dividerColor,
            },
          ]}
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

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    minHeight: 120,
    fontSize: 15,
  },
});

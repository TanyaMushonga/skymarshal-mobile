import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  onStart: () => void;
}

export const StartPatrolCTA = ({ onStart }: Props) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        alignItems: 'center',
        borderWidth: isDark ? 0 : 1,
        borderColor: colors.border,
      }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: isDark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.05)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
        <Ionicons name="shield-checkmark-outline" size={32} color={colors.warning} />
      </View>

      <Text
        style={{
          color: colors.text,
          fontSize: 20,
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: 8,
        }}>
        No Active Patrol
      </Text>

      <Text
        style={{
          color: colors.textSecondary,
          fontSize: 14,
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: 20,
          paddingHorizontal: 20,
        }}>
        You are currently off-duty. Start a new patrol to monitor your assigned sector.
      </Text>

      <TouchableOpacity
        onPress={onStart}
        activeOpacity={0.8}
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 32,
          paddingVertical: 14,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        <Ionicons name="play" size={18} color={isDark ? '#000' : '#FFF'} />
        <Text
          style={{
            color: isDark ? '#000' : '#FFF',
            fontSize: 16,
            fontWeight: '700',
          }}>
          Initiate Patrol
        </Text>
      </TouchableOpacity>
    </View>
  );
};

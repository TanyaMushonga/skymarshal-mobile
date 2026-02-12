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
      className={`mb-6 items-center rounded-2xl border p-6 ${isDark ? 'border-transparent' : ''}`}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}>
      <View
        className={`mb-4 h-16 w-16 items-center justify-center rounded-full ${
          isDark ? 'bg-amber-500/10' : 'bg-amber-500/5'
        }`}>
        <Ionicons name="shield-checkmark-outline" size={32} color={colors.warning} />
      </View>

      <Text className="mb-2 text-center text-xl font-bold" style={{ color: colors.text }}>
        No Active Patrol
      </Text>

      <Text
        className="mb-6 px-5 text-center text-sm leading-5"
        style={{ color: colors.textSecondary }}>
        You are currently off-duty. Start a new patrol to monitor your assigned sector.
      </Text>

      <TouchableOpacity
        onPress={onStart}
        activeOpacity={0.8}
        className="flex-row items-center gap-2.5 rounded-xl px-8 py-3.5"
        style={{ backgroundColor: colors.primary }}>
        <Ionicons name="play" size={18} color={isDark ? '#000' : '#FFF'} />
        <Text className="text-base font-bold" style={{ color: isDark ? '#000' : '#FFF' }}>
          Initiate Patrol
        </Text>
      </TouchableOpacity>
    </View>
  );
};

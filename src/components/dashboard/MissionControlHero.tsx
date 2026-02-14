import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { DashboardStats } from '@/types/api';

interface Props {
  activePatrol: DashboardStats['active_patrol'];
  onEndPatrol: () => void;
}

export const MissionControlHero = ({ activePatrol, onEndPatrol }: Props) => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [timer, setTimer] = useState(activePatrol?.flight_duration_seconds || 0);

  useEffect(() => {
    const interval = setInterval(() => setTimer((p) => p + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const batteryColor = (lvl: number) => {
    if (lvl > 50) return '#10B981';
    if (lvl > 20) return '#F59E0B';
    return '#EF4444';
  };

  if (!activePatrol) return null;

  const battery = activePatrol.battery_level || 0;
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const liveBg = isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.1)';

  return (
    <View
      className={`mb-6 overflow-hidden rounded-2xl border ${isDark ? 'border-transparent' : ''}`}
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}>
      {/* Top bar */}
      <View
        className="flex-row items-center justify-between border-b px-5 pb-3.5 pt-[18px]"
        style={{ borderBottomColor: borderColor }}>
        <View className="flex-row items-center gap-2.5">
          {/* <Ionicons name="airplane-outline" size={18} color={colors.warning} /> */}
          <View>
            <Text
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: colors.warning }}>
              Mission Control
            </Text>
            <Text className="mt-0.5 text-[15px] font-semibold" style={{ color: colors.text }}>
              {activePatrol.drone?.name || 'Active Drone'}
            </Text>
          </View>
        </View>
        {/* Live pill */}
        <View
          className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{ backgroundColor: liveBg }}>
          <View className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <Text className="text-[11px] font-bold tracking-widest text-emerald-500">LIVE</Text>
        </View>
      </View>

      {/* Timer */}
      <View className="items-center border-b py-6" style={{ borderBottomColor: borderColor }}>
        <Text
          className="text-[52px] font-bold leading-[56px] tracking-tighter"
          style={{ color: colors.text, fontVariant: ['tabular-nums'] }}>
          {formatTime(timer)}
        </Text>
        <Text
          className="mt-1.5 text-[11px] font-medium uppercase tracking-widest"
          style={{ color: colors.textSecondary }}>
          Flight Duration
        </Text>
      </View>

      {/* Stats row */}
      <View className="flex-row border-b" style={{ borderBottomColor: borderColor }}>
        {/* Battery */}
        <View className="flex-[1.4] border-r p-4" style={{ borderRightColor: borderColor }}>
          <Text
            className="mb-2 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textSecondary }}>
            Battery
          </Text>
          <View className="mb-2 flex-row items-baseline gap-0.5">
            <Text
              className="text-xl font-bold tracking-tighter"
              style={{ color: colors.text, fontVariant: ['tabular-nums'] }}>
              {battery}
            </Text>
            <Text className="text-[13px]" style={{ color: colors.textSecondary }}>
              %
            </Text>
          </View>
          <View
            className={`h-[3px] overflow-hidden rounded-full ${
              isDark ? 'bg-white/10' : 'bg-black/5'
            }`}>
            <View
              className="h-full rounded-full"
              style={{
                width: `${battery}%`,
                backgroundColor: batteryColor(battery),
              }}
            />
          </View>
        </View>

        {/* Detections */}
        <View
          className="flex-1 items-center justify-center border-r p-4"
          style={{ borderRightColor: borderColor }}>
          <Text
            className="text-[28px] font-bold tracking-tighter"
            style={{ color: colors.text, fontVariant: ['tabular-nums'] }}>
            {activePatrol.detection_count || 0}
          </Text>
          <Text
            className="mt-1 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textSecondary }}>
            Detections
          </Text>
        </View>

        {/* Violations */}
        <View className="flex-1 items-center justify-center p-4">
          <Text
            className="text-[28px] font-bold tracking-tighter text-red-500"
            style={{ fontVariant: ['tabular-nums'] }}>
            {activePatrol.violation_count || 0}
          </Text>
          <Text
            className="mt-1 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: colors.textSecondary }}>
            Violations
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row gap-3 p-4">
        <TouchableOpacity
          onPress={onEndPatrol}
          className={`flex-1 items-center rounded-xl border py-3 ${
            isDark ? 'border-red-500/30 bg-red-500/10' : 'border-red-500/20 bg-red-50'
          }`}>
          <Text className="text-sm font-semibold text-red-500">Terminate Mission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push(`/(tabs)/patrols/active?id=${activePatrol.id}`)}
          className="flex-1 items-center rounded-xl py-3"
          style={{ backgroundColor: colors.primary }}>
          <Text className={`text-sm font-bold ${isDark ? 'text-black' : 'text-white'}`}>
            Full Telemetry
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

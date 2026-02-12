import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card, Badge } from '@/components/ui';
import { DashboardStats } from '@/types/api';

// Fallback if expo-linear-gradient is missing
const LinearGradient = ({ children, style }: any) => (
  <View style={[{ backgroundColor: '#000000' }, style]}>{children}</View>
);

interface Props {
  activePatrol: DashboardStats['active_patrol'];
  onEndPatrol: () => void;
}

export const MissionControlHero = ({ activePatrol, onEndPatrol }: Props) => {
  const router = useRouter();
  const [timer, setTimer] = useState(activePatrol?.flight_duration_seconds || 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev: number) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return '#10B981';
    if (level > 20) return '#F59E0B';
    return '#EF4444';
  };

  if (!activePatrol) return null;

  return (
    <Card className="mb-6 overflow-hidden border-0 p-0" variant="elevated">
      <LinearGradient style={styles.gradient}>
        <View className="p-5">
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View
                className="bg-gold-500/10 rounded-full p-2"
                style={{ backgroundColor: '#F59E0B20' }}>
                <Ionicons name="airplane-outline" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text className="text-xs font-semibold uppercase tracking-widest text-[#F59E0B]">
                  Mission Control
                </Text>
                <Text className="text-lg font-bold text-white">
                  {activePatrol.drone?.name || (activePatrol as any).drone_id || 'Active Drone'}
                </Text>
              </View>
            </View>
            <Badge label="LIVE" variant="success" dot />
          </View>

          <View className="mb-6 items-center">
            <Text className="text-4xl font-black tracking-tighter text-white">
              {formatTime(timer)}
            </Text>
            <Text className="text-xs font-medium uppercase tracking-widest text-slate-400">
              Flight Duration
            </Text>
          </View>

          <View className="mb-6 flex-row justify-between gap-4">
            <View
              className="flex-1 rounded-2xl bg-white/5 p-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-[10px] font-bold uppercase text-slate-500">Battery</Text>
                <Text className="text-xs font-bold text-white">
                  {activePatrol.battery_level || 0}%
                </Text>
              </View>
              <View
                className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <View
                  style={{
                    width: `${activePatrol.battery_level || 0}%`,
                    backgroundColor: getBatteryColor(activePatrol.battery_level || 0),
                  }}
                  className="h-full"
                />
              </View>
            </View>

            <View
              className="flex-1 items-center justify-center rounded-2xl bg-white/5 p-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <Text className="text-lg font-bold text-white">
                {activePatrol.detection_count || 0}
              </Text>
              <Text className="text-[10px] font-bold uppercase text-slate-500">Detections</Text>
            </View>

            <View
              className="flex-1 items-center justify-center rounded-2xl bg-white/5 p-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <Text className="text-lg font-bold text-red-500">
                {activePatrol.violation_count || 0}
              </Text>
              <Text className="text-[10px] font-bold uppercase text-slate-500">Violations</Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onEndPatrol}
              className="flex-1 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 py-3">
              <Text className="font-bold text-red-500">Terminate Mission</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/patrols/active')}
              className="flex-1 items-center justify-center rounded-xl bg-[#F59E0B] py-3">
              <Text className="font-bold text-black">Full Telemetry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 16,
  },
});

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
  const { isDark } = useTheme();
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
  const bg = isDark ? '#0A0A0A' : '#0F172A';

  return (
    <View style={{ backgroundColor: bg, borderRadius: 16, marginBottom: 24, overflow: 'hidden' }}>
      {/* Top bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 18,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.06)',
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name="airplane-outline" size={18} color="#F59E0B" />
          <View>
            <Text
              style={{
                color: '#F59E0B',
                fontSize: 10,
                fontWeight: '700',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}>
              Mission Control
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginTop: 1 }}>
              {activePatrol.drone?.name || 'Active Drone'}
            </Text>
          </View>
        </View>
        {/* Live pill */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: 'rgba(16,185,129,0.12)',
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
          <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 }}>
            LIVE
          </Text>
        </View>
      </View>

      {/* Timer */}
      <View
        style={{
          alignItems: 'center',
          paddingVertical: 24,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.06)',
        }}>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 52,
            fontWeight: '700',
            letterSpacing: -2,
            lineHeight: 56,
            fontVariant: ['tabular-nums'],
          }}>
          {formatTime(timer)}
        </Text>
        <Text
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 11,
            fontWeight: '500',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            marginTop: 6,
          }}>
          Flight Duration
        </Text>
      </View>

      {/* Stats row */}
      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.06)',
        }}>
        {/* Battery */}
        <View
          style={{
            flex: 1.4,
            padding: 16,
            borderRightWidth: 1,
            borderRightColor: 'rgba(255,255,255,0.06)',
          }}>
          <Text
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 10,
              fontWeight: '600',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
            Battery
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: 8 }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 20,
                fontWeight: '700',
                letterSpacing: -0.5,
                fontVariant: ['tabular-nums'],
              }}>
              {battery}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>%</Text>
          </View>
          <View
            style={{
              height: 3,
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 2,
              overflow: 'hidden',
            }}>
            <View
              style={{
                width: `${battery}%`,
                height: '100%',
                backgroundColor: batteryColor(battery),
                borderRadius: 2,
              }}
            />
          </View>
        </View>

        {/* Detections */}
        <View
          style={{
            flex: 1,
            padding: 16,
            alignItems: 'center',
            justifyContent: 'center',
            borderRightWidth: 1,
            borderRightColor: 'rgba(255,255,255,0.06)',
          }}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 28,
              fontWeight: '700',
              letterSpacing: -1,
              fontVariant: ['tabular-nums'],
            }}>
            {activePatrol.detection_count || 0}
          </Text>
          <Text
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 10,
              fontWeight: '600',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              marginTop: 4,
            }}>
            Detections
          </Text>
        </View>

        {/* Violations */}
        <View style={{ flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
          <Text
            style={{
              color: '#EF4444',
              fontSize: 28,
              fontWeight: '700',
              letterSpacing: -1,
              fontVariant: ['tabular-nums'],
            }}>
            {activePatrol.violation_count || 0}
          </Text>
          <Text
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 10,
              fontWeight: '600',
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              marginTop: 4,
            }}>
            Violations
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', padding: 16, gap: 12 }}>
        <TouchableOpacity
          onPress={onEndPatrol}
          style={{
            flex: 1,
            paddingVertical: 13,
            alignItems: 'center',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'rgba(239,68,68,0.3)',
            backgroundColor: 'rgba(239,68,68,0.08)',
          }}>
          <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '600' }}>
            Terminate Mission
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/patrols/active')}
          style={{
            flex: 1,
            paddingVertical: 13,
            alignItems: 'center',
            borderRadius: 10,
            backgroundColor: '#F59E0B',
          }}>
          <Text style={{ color: '#000000', fontSize: 14, fontWeight: '700' }}>Full Telemetry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

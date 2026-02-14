import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { safeFormatSnapshot } from '@/lib/dateUtils';
import { patrolsApi, violationsApi } from '@/api';
import { useTheme } from '@/contexts/ThemeContext';
import { usePatrolStore } from '@/stores/patrolStore';
import { useAuthStore } from '@/stores/authStore';

const formatDuration = (seconds?: number) => {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const STATUS_CONFIG: Record<string, { color: string; darkBg: string; lightBg: string }> = {
  COMPLETED: { color: '#3B82F6', darkBg: '#0D1525', lightBg: '#EFF6FF' },
  ACTIVE: { color: '#10B981', darkBg: '#0D2A1A', lightBg: '#ECFDF5' },
  CANCELLED: { color: '#6B7280', darkBg: '#1A1A1A', lightBg: '#F3F4F6' },
};

export default function PatrolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();

  const { activePatrol } = usePatrolStore();
  const { data: patrol, isLoading } = useQuery({
    queryKey: ['patrol', id || 'active'],
    queryFn: () =>
      id && id !== 'active' ? patrolsApi.get(id) : patrolsApi.getActive(user?.email || ''),
    enabled: !!id || !!user?.email,
    initialData: id && activePatrol?.id === id ? activePatrol : undefined,
  });

  const { data: violations } = useQuery({
    queryKey: ['violations', 'patrol', id],
    queryFn: () => violationsApi.list({ patrol: id, limit: 20 }),
    enabled: !!id,
  });

  const divider = isDark ? '#1F1F1F' : '#E8E8E8';
  const bg = isDark ? colors.background : '#FFFFFF';

  const statusCfg = STATUS_CONFIG[patrol?.status ?? ''] ?? STATUS_CONFIG.CANCELLED;

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: bg },
            headerShadowVisible: false,
            headerTintColor: colors.text,
            title: 'Patrol Details',
            headerTitleStyle: { fontSize: 17, fontWeight: '600' },
          }}
        />
        <View
          style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Loading…</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: bg },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          title: `#${id?.slice(0, 8).toUpperCase()}`,
          headerTitleStyle: { fontSize: 17, fontWeight: '600' },
        }}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: bg }}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>
        {/* ── Summary stat panel (dark) ────────────────────────────────── */}
        <View
          style={{
            backgroundColor: isDark ? '#0A0A0A' : '#0F172A',
          }}>
          {/* Title row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.06)',
            }}>
            <View>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 11,
                  fontWeight: '600',
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                }}>
                {patrol?.drone?.name || patrol?.drone_id || 'Drone'}
              </Text>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginTop: 2 }}>
                {safeFormatSnapshot(
                  patrol?.start_time || patrol?.started_at,
                  'MMM d, yyyy · HH:mm'
                )}
              </Text>
            </View>
            {/* Status chip */}
            <View
              style={{
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: statusCfg.darkBg,
              }}>
              <Text
                style={{
                  color: statusCfg.color,
                  fontSize: 11,
                  fontWeight: '700',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}>
                {patrol?.status ?? '—'}
              </Text>
            </View>
          </View>

          {/* Duration */}
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
                fontSize: 44,
                fontWeight: '700',
                letterSpacing: -1.5,
                lineHeight: 48,
                fontVariant: ['tabular-nums'],
              }}>
              {formatDuration(
                patrol?.flight_duration_seconds !== undefined
                  ? patrol?.flight_duration_seconds
                  : patrol?.duration
              )}
            </Text>
            <Text
              style={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: 11,
                fontWeight: '500',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                marginTop: 6,
              }}>
              Total Duration
            </Text>
          </View>

          {/* Detection / violation counts */}
          <View style={{ flexDirection: 'row' }}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 18,
                borderRightWidth: 1,
                borderRightColor: 'rgba(255,255,255,0.06)',
              }}>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 28,
                  fontWeight: '700',
                  letterSpacing: -0.8,
                  fontVariant: ['tabular-nums'],
                }}>
                {patrol?.detection_count ?? 0}
              </Text>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: 10,
                  fontWeight: '600',
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  marginTop: 4,
                }}>
                Detections
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center', paddingVertical: 18 }}>
              <Text
                style={{
                  color: (patrol?.violation_count ?? 0) > 0 ? '#EF4444' : '#FFFFFF',
                  fontSize: 28,
                  fontWeight: '700',
                  letterSpacing: -0.8,
                  fontVariant: ['tabular-nums'],
                }}>
                {patrol?.violation_count ?? 0}
              </Text>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.35)',
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
        </View>

        {/* ── Violations list ───────────────────────────────────────────── */}
        <View style={{ marginTop: 24 }}>
          <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: '600',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                paddingHorizontal: 4,
              }}>
              Violations ({violations?.count ?? 0})
            </Text>
          </View>

          {violations?.results && violations.results.length > 0 ? (
            <View style={{ borderTopWidth: 1, borderTopColor: divider }}>
              {violations.results.map((violation, index) => {
                const isLast = index === violations.results.length - 1;
                return (
                  <TouchableOpacity
                    key={violation.id}
                    onPress={() => router.push(`/violations/${violation.id}`)}
                    activeOpacity={0.7}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 14,
                        paddingHorizontal: 20,
                        borderBottomWidth: isLast ? 0 : 1,
                        borderBottomColor: divider,
                      }}>
                      {/* Icon */}
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          backgroundColor: isDark ? '#2A0F0F' : '#FEF2F2',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                          flexShrink: 0,
                        }}>
                        <Ionicons name="warning-outline" size={18} color="#EF4444" />
                      </View>

                      {/* Content */}
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 3,
                          }}>
                          <Text
                            style={{
                              color: colors.text,
                              fontSize: 15,
                              fontWeight: '500',
                              fontVariant: ['tabular-nums'],
                            }}>
                            {violation.detection?.license_plate || '—'}
                          </Text>
                          <View
                            style={{
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 4,
                              backgroundColor: isDark ? '#2A0F0F' : '#FEE2E2',
                            }}>
                            <Text
                              style={{
                                color: '#EF4444',
                                fontSize: 10,
                                fontWeight: '700',
                                letterSpacing: 0.5,
                                textTransform: 'uppercase',
                              }}>
                              {violation.violation_type}
                            </Text>
                          </View>
                        </View>
                        <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 18 }}>
                          {safeFormatSnapshot(violation.timestamp, 'HH:mm:ss')}
                          {violation.recorded_speed ? ` · ${violation.recorded_speed} km/h` : ''}
                        </Text>
                      </View>

                      <Ionicons name="chevron-forward" size={15} color={isDark ? '#333' : '#CCC'} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Ionicons name="shield-checkmark-outline" size={36} color="#10B981" />
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 15,
                  fontWeight: '500',
                  marginTop: 14,
                }}>
                No violations
              </Text>
              <Text style={{ color: isDark ? '#333' : '#CCC', fontSize: 13, marginTop: 4 }}>
                Clean patrol record
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

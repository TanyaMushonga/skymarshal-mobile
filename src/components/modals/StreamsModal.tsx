import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '@/contexts/ThemeContext';
import { Card, Button, Badge } from '@/components/ui';
import { streamsApi, Stream } from '@/api/streams';
import { dronesApi } from '@/api/drones';
import { violationsApi } from '@/api/violations';
import { Violation } from '@/types/api';
import AnnotatedVideoView from '@/components/streaming/AnnotatedVideoView';
import { useToast } from '@/hooks/useToast';
import { useUIStore } from '@/stores/uiStore';
import { patrolsApi } from '@/api/patrols';

export const StreamsModal = () => {
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();
  const { streamsModalVisible, setStreamsModalVisible, targetStreamId } = useUIStore();

  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch active streams
  const {
    data: streams = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Stream[]>({
    queryKey: ['streams', 'active'],
    queryFn: () => streamsApi.getStreams(true),
    enabled: streamsModalVisible,
    refetchInterval: 5000, // Faster refresh for dashboard feel
  });

  // Fetch drones for simulation targets
  const { data: drones = [] } = useQuery({
    queryKey: ['drones', 'available'],
    queryFn: async () => {
      const res = await dronesApi.list();
      return res.results;
    },
    enabled: streamsModalVisible && streams.length === 0,
  });

  // Auto-select stream if targetStreamId is provided
  useEffect(() => {
    if (streamsModalVisible && targetStreamId) {
      setSelectedStreamId(targetStreamId);
    }
  }, [streamsModalVisible, targetStreamId]);

  const onRefresh = () => {
    refetch();
  };

  // Fetch recent violations for snapshots
  const { data: recentViolations = [] } = useQuery({
    queryKey: ['violations', 'recent'],
    queryFn: async () => {
      const res = await violationsApi.list({ today: true, limit: 5 });
      return res.results;
    },
    enabled: streamsModalVisible,
    refetchInterval: 10000,
  });

  const handleSimulate = async () => {
    try {
      setIsSimulating(true);
      
      // 1. Try to find drone ID from active patrols first
      const activePatrols = await patrolsApi.list({ status: 'ACTIVE' });
      const patrol = activePatrols.results?.[0];
      
      const targetDroneId = patrol?.drone_id_str || patrol?.drone_id || drones[0]?.drone_id || 'DRN-123';
      const patrolId = patrol?.id;

      showToast('info', 'Initializing Simulation', `Setting up live feed for ${targetDroneId}...`);

      await streamsApi.simulateForDrone(targetDroneId, patrolId);

      showToast('success', 'Simulation Started', 'Live feed is now being generated.');
      setTimeout(() => refetch(), 1000);
    } catch (error) {
      console.error('[StreamsModal] Simulation error:', error);
      showToast('error', 'Simulation Failed', 'Could not initialize simulated stream.');
    } finally {
      setIsSimulating(false);
    }
  };

  const toggleProcessing = async (stream: Stream) => {
    try {
      if (stream.is_active) {
        Alert.alert('Stop Processing?', `Stop computer vision analysis for ${stream.drone_name}?`, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Stop',
            style: 'destructive',
            onPress: async () => {
              await streamsApi.stopStream(stream.id);
              showToast(
                'success',
                'Processing Stopped',
                `Analysis stopped for ${stream.drone_name}`
              );
              refetch();
            },
          },
        ]);
      } else {
        await streamsApi.startStream(stream.id);
        showToast('success', 'Processing Started', `Analysis started for ${stream.drone_name}`);
        refetch();
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Action Failed', 'Could not update stream status');
    }
  };

  const selectedStream = streams.find((s) => s.id === selectedStreamId);

  return (
    <Modal
      visible={streamsModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setStreamsModalVisible(false)}>
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: isDark ? colors.background : '#F9FAFB' }}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between border-b px-5 py-4"
          style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb' }}>
          <View>
            <Text className="text-xl font-bold" style={{ color: colors.text }}>
              Live Feeds
            </Text>
            <View className="flex-row items-center gap-1.5">
              <View className="h-2 w-2 rounded-full bg-emerald-500" />
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {streams.length} Active {streams.length === 1 ? 'Stream' : 'Streams'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setStreamsModalVisible(false)}
            className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Ionicons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Recent Violations Ribbon */}
        {recentViolations.length > 0 && (
          <View
            className="border-b"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e5e7eb' }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ padding: 12, gap: 12 }}>
              {recentViolations.map((v: Violation) => (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => useUIStore.getState().openViolationDetail(v.id)}
                  className="flex-row items-center rounded-full border px-3 py-1.5"
                  style={{
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
                    borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FECACA',
                  }}>
                  <View className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                  <Text
                    className="text-xs font-bold"
                    style={{ color: isDark ? '#FCA5A5' : '#B91C1C' }}>
                    {v.violation_type} • {(v.detection as any)?.license_plate || 'N/A'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Main Video Player */}
        {selectedStream && (
          <View className="px-4 pt-4">
            <View className="relative">
              <AnnotatedVideoView
                streamId={selectedStream.stream_id}
                droneName={selectedStream.drone_name}
              />
              <TouchableOpacity
                className="absolute right-4 top-4 z-20 h-10 w-10 items-center justify-center rounded-full bg-black/60"
                onPress={() => setSelectedStreamId(null)}>
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <View className="mt-4 flex-row gap-3">
              <Button
                title={selectedStreamId === selectedStream?.id ? 'Close Stream' : 'Connect to Feed'}
                variant={selectedStreamId === selectedStream?.id ? 'secondary' : 'primary'}
                size="md"
                onPress={() =>
                  setSelectedStreamId(
                    selectedStreamId === selectedStream?.id ? null : selectedStream?.id || null
                  )
                }
                className="flex-1"
                icon={
                  <Ionicons
                    name={
                      selectedStreamId === selectedStream?.id
                        ? 'stop-circle-outline'
                        : 'videocam-outline'
                    }
                    size={18}
                    color={selectedStreamId === selectedStream?.id ? 'white' : 'black'}
                  />
                }
              />
            </View>
          </View>
        )}

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}>
          {streams.map((stream) => (
            <TouchableOpacity
              key={stream.id}
              onPress={() => setSelectedStreamId(stream.id)}
              activeOpacity={0.7}>
              <Card className="mb-4 overflow-hidden">
                <View className="flex-row items-center justify-between px-4 py-3">
                  <View className="flex-row items-center gap-3">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}>
                      <Ionicons name="videocam" size={20} color={colors.primary} />
                    </View>
                    <View>
                      <Text className="font-bold" style={{ color: colors.text }}>
                        {stream.drone_name}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                        {stream.resolution} • {stream.frame_rate}fps
                      </Text>
                    </View>
                  </View>
                  <Badge
                    label={stream.is_active ? 'Active' : 'Inactive'}
                    variant={stream.is_active ? 'success' : 'default'}
                  />
                </View>
              </Card>
            </TouchableOpacity>
          ))}

          {streams.length === 0 && !isLoading && (
            <View className="items-center justify-center py-20">
              <View className="mb-6 h-24 w-24 items-center justify-center rounded-3xl bg-gray-100 dark:bg-gray-800">
                <Ionicons name="videocam-off" size={40} color={colors.textSecondary} />
              </View>
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                No Active Streams
              </Text>
              <Text
                className="mt-2 px-10 text-center text-sm leading-5"
                style={{ color: colors.textSecondary }}>
                There are currently no live drone feeds transmitted from the field.
              </Text>

              <Button
                title="Simulate Live Feed"
                variant="primary"
                loading={isSimulating}
                onPress={handleSimulate}
                className="mt-8 px-10"
                icon={<Ionicons name="flash-outline" size={18} color="black" />}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

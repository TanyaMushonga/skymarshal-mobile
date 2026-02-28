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
import { DroneStreamPlayer } from '@/components/streaming/DroneStreamPlayer';
import { useToast } from '@/hooks/useToast';
import { useUIStore } from '@/stores/uiStore';

export const StreamsModal = () => {
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();
  const { streamsModalVisible, setStreamsModalVisible, targetStreamId } = useUIStore();

  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);

  const {
    data: streams = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Stream[]>({
    queryKey: ['streams', 'active'],
    queryFn: () => streamsApi.getStreams(true),
    enabled: streamsModalVisible, // Only fetch when modal is open
    refetchInterval: 10000, // Refresh every 10s
  });

  // Auto-select stream if targetStreamId is provided
  useEffect(() => {
    if (streamsModalVisible && targetStreamId) {
      setSelectedStreamId(targetStreamId);
    } else if (
      streamsModalVisible &&
      !selectedStreamId &&
      streams.length > 0 &&
      targetStreamId === null
    ) {
      // Optional: Auto-select first stream if none specific is requested?
      // For now, adhere to "Link Patrol to Stream" -> if targetStreamId is present, use it.
    }
  }, [streamsModalVisible, targetStreamId, streams, selectedStreamId]);

  const onRefresh = () => {
    refetch();
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
          className="flex-row items-center justify-between border-b px-4 py-2"
          style={{ borderColor: isDark ? colors.border : '#e5e7eb' }}>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Live Feeds
          </Text>
          <TouchableOpacity onPress={() => setStreamsModalVisible(false)} className="p-2">
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Main Video Player (Selected Stream) */}
        {selectedStream ? (
          <View className="relative mb-4 h-64 w-full bg-black">
            <DroneStreamPlayer
              rtspUrl={selectedStream.rtsp_url}
              isActive={true}
              style={{ height: '100%', width: '100%' }}
            />
            <View className="absolute left-2 top-2 rounded bg-black/60 px-2 py-1">
              <Text className="font-bold text-white">{selectedStream.drone_name}</Text>
            </View>
            <TouchableOpacity
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1"
              onPress={() => setSelectedStreamId(null)}>
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : null}

        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}>
          <Text className="mb-4 text-lg font-bold" style={{ color: colors.text }}>
            Active Drone Streams ({streams.length})
          </Text>

          {streams.length === 0 && !isLoading ? (
            <View className="items-center py-10">
              <Ionicons name="videocam-off-outline" size={48} color={colors.textSecondary} />
              <Text className="mt-2 text-center" style={{ color: colors.textSecondary }}>
                No active streams found. Ensure drones are online.
              </Text>
            </View>
          ) : (
            streams.map((stream) => (
              <Card key={stream.id} className="mb-4 overflow-hidden p-0">
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setSelectedStreamId(stream.id)}>
                  {/* Thumbnail / Permission to Play overlay */}
                  <View className="relative h-48 items-center justify-center bg-gray-900">
                    {/* If this is the selected stream, we show a placeholder saying "Playing above" */}
                    {selectedStreamId === stream.id ? (
                      <Text className="font-bold text-blue-400">Playing in Main View...</Text>
                    ) : (
                      <>
                        <Ionicons name="play-circle" size={48} color="white" />
                        <Text className="mt-2 text-white">Tap to View Stream</Text>
                      </>
                    )}

                    <View className="absolute right-2 top-2 flex-row gap-2">
                      <Badge label={stream.resolution} variant="default" size="sm" />
                      <Badge label={`${stream.frame_rate} FPS`} variant="default" size="sm" />
                    </View>
                  </View>

                  <View className="p-4">
                    <View className="mb-2 flex-row items-center justify-between">
                      <View>
                        <Text className="text-lg font-bold" style={{ color: colors.text }}>
                          {stream.drone_name}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                          ID: {stream.drone_id}
                        </Text>
                      </View>
                      <Badge
                        label={stream.is_active ? 'ONLINE' : 'OFFLINE'}
                        variant={stream.is_active ? 'success' : 'default'}
                        dot
                      />
                    </View>

                    <View className="mt-2 flex-row gap-2">
                      <Button
                        title={selectedStreamId === stream.id ? 'Close Feed' : 'Watch Feed'}
                        variant={selectedStreamId === stream.id ? 'secondary' : 'primary'}
                        size="sm"
                        onPress={() =>
                          setSelectedStreamId(selectedStreamId === stream.id ? null : stream.id)
                        }
                        style={{ flex: 1 }}
                        icon={<Ionicons name="videocam" size={16} color="white" />}
                      />
                      <Button
                        title="More Options"
                        variant="outline"
                        size="sm"
                        onPress={() => toggleProcessing(stream)}
                        style={{ width: 44 }}
                        icon={<Ionicons name="ellipsis-horizontal" size={16} color={colors.text} />}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </Card>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

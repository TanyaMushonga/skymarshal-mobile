import React from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useVideoStream } from '@/hooks/useVideoStream';
import { BufferedVideoPlayer } from './BufferedVideoPlayer';

interface DroneStreamPlayerProps {
  streamId: string;
  isActive?: boolean;
  style?: any;
  onStartSimulation?: () => void;
  useBuffered?: boolean;
}

export const DroneStreamPlayer: React.FC<DroneStreamPlayerProps> = ({
  streamId,
  isActive = true,
  style,
  onStartSimulation,
  useBuffered = true,
}) => {
  const { colors } = useTheme();
  const { frame, isConnected, error } = useVideoStream(streamId);

  if (!isActive) {
    return (
      <View style={[styles.container, styles.center, style, { backgroundColor: '#000' }]}>
        <Ionicons name="videocam-off" size={48} color="#666" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Stream Offline</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {useBuffered ? (
        <BufferedVideoPlayer streamId={streamId} isActive={isActive} />
      ) : frame ? (
        <Image
          source={{ uri: `data:image/jpeg;base64,${frame}` }}
          style={styles.video}
          resizeMode="contain"
          fadeDuration={0}
        />
      ) : (
        <View style={[styles.center, { flex: 1 }]}>
          {isConnected ? (
            <>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ color: '#fff', marginTop: 10 }}>Connecting to Drone...</Text>
            </>
          ) : error ? (
            <>
              <Ionicons name="warning" size={48} color="#EF4444" />
              <Text style={{ color: '#fff', marginTop: 10 }}>Stream Connection Failed</Text>
              {onStartSimulation && (
                <TouchableOpacity
                  onPress={onStartSimulation}
                  style={{
                    marginTop: 16,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    backgroundColor: colors.primary,
                    borderRadius: 10,
                  }}>
                  <Text style={{ color: '#000', fontWeight: '700', fontSize: 13 }}>
                    Start Simulation
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <Ionicons name="videocam-off" size={48} color="#666" />
              <Text style={{ color: '#fff', marginTop: 10 }}>Waiting for live feed...</Text>
            </>
          )}
        </View>
      )}

      {/* Live badge */}
      {isConnected && (
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 12,
    minHeight: 200,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

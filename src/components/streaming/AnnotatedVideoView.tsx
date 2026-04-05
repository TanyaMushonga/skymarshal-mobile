import React from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useVideoStream } from '../../hooks/useVideoStream';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AnnotatedVideoViewProps {
  streamId: string;
  droneName?: string;
}

const AnnotatedVideoView: React.FC<AnnotatedVideoViewProps> = ({
  streamId,
  droneName = 'Drone Feed',
}) => {
  const { frame, isConnected, error } = useVideoStream(streamId);

  return (
    <View style={styles.container}>
      {/* Header Overlay */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <View style={styles.liveDot} />
          <Text style={styles.badgeText}>LIVE • {droneName}</Text>
        </View>
        <MaterialCommunityIcons name="shield-check" size={18} color="#10b981" />
      </View>

      {/* Video Content */}
      <View style={styles.videoContainer}>
        {frame ? (
          <Image
            key={`frame-${streamId}`}
            source={{ uri: `data:image/jpeg;base64,${frame}` }}
            style={styles.frame}
            resizeMode="cover"
            fadeDuration={0}
          />
        ) : (
          <View style={styles.placeholder}>
            {isConnected ? (
              <>
                <ActivityIndicator size="large" color="#0ea5e9" />
                <Text style={styles.placeholderText}>Loading live feed...</Text>
              </>
            ) : error ? (
              <Text style={styles.errorText}>Connection Error</Text>
            ) : (
              <>
                <MaterialCommunityIcons name="wifi-off" size={48} color="#475569" />
                <Text style={styles.placeholderText}>Stream Offline</Text>
              </>
            )}
          </View>
        )}
      </View>

      {/* Connection Status Indicator */}
      <View style={styles.footer}>
        <View style={styles.statusBox}>
          <MaterialCommunityIcons
            name="wifi"
            size={14}
            color={isConnected ? '#10b981' : '#ef4444'}
          />
          <Text style={[styles.statusText, { color: isConnected ? '#10b981' : '#ef4444' }]}>
            {isConnected ? 'STABLE' : 'DISCONNECTED'}
          </Text>
        </View>
        <Text style={styles.latencyText}>4K • 30 FPS</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  videoContainer: {
    aspectRatio: 16 / 9,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  latencyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default AnnotatedVideoView;

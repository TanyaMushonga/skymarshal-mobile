import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { VLCPlayer } from 'react-native-vlc-media-player';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface DroneStreamPlayerProps {
  rtspUrl: string;
  isActive?: boolean;
  style?: any;
}

export const DroneStreamPlayer: React.FC<DroneStreamPlayerProps> = ({
  rtspUrl,
  isActive = true,
  style,
}) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
      <VLCPlayer
        source={{ uri: rtspUrl }}
        autoplay={true}
        resizeMode="contain"
        style={styles.video}
        autoAspectRatio={true}
        onBuffering={() => setLoading(true)}
        onPlaying={() => {
          setLoading(false);
          setError(false);
        }}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />

      {loading && !error && (
        <View style={[styles.overlay, styles.center]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: '#fff', marginTop: 10 }}>Connecting to Drone...</Text>
        </View>
      )}

      {error && (
        <View style={[styles.overlay, styles.center]}>
          <Ionicons name="warning" size={48} color="#EF4444" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Stream Connection Failed</Text>
          <Text style={{ color: '#aaa', fontSize: 12 }}>Check network or VPN</Text>
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
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, useColorScheme } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  heading: string;
  message: string;
}

interface ToastProps extends ToastMessage {
  onClose: (id: string) => void;
  duration?: number;
}

const { width: screenWidth } = Dimensions.get('window');

const Toast: React.FC<ToastProps> = ({ id, type, heading, message, onClose, duration = 5000 }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-100);
  const scale = useSharedValue(0.8);
  const progress = useSharedValue(0);

  const typeConfig = {
    success: {
      icon: <Ionicons name="checkmark-circle" size={22} color={isDark ? '#10B981' : '#059669'} />,
      backgroundColor: isDark ? '#064E3B' : '#F0FDF4',
      borderColor: isDark ? '#047857' : '#10B981',
      shadowColor: '#10B981',
      progressColor: isDark ? '#10B981' : '#10B981',
      iconBackgroundColor: isDark ? '#065F46' : '#D1FAE5',
      headingColor: isDark ? '#A7F3D0' : '#065F46',
      messageColor: isDark ? '#6EE7B7' : '#047857',
    },
    error: {
      icon: <Ionicons name="alert-circle" size={22} color={isDark ? '#F87171' : '#DC2626'} />,
      backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2',
      borderColor: isDark ? '#B91C1C' : '#EF4444',
      shadowColor: '#EF4444',
      progressColor: isDark ? '#F87171' : '#EF4444',
      iconBackgroundColor: isDark ? '#991B1B' : '#FEE2E2',
      headingColor: isDark ? '#FCA5A5' : '#7F1D1D',
      messageColor: isDark ? '#F87171' : '#B91C1C',
    },
    info: {
      icon: <Ionicons name="information-circle" size={22} color={isDark ? '#60A5FA' : '#2563EB'} />,
      backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF',
      borderColor: isDark ? '#2563EB' : '#3B82F6',
      shadowColor: '#3B82F6',
      progressColor: isDark ? '#60A5FA' : '#3B82F6',
      iconBackgroundColor: isDark ? '#1E40AF' : '#DBEAFE',
      headingColor: isDark ? '#93C5FD' : '#1E3A8A',
      messageColor: isDark ? '#60A5FA' : '#1D4ED8',
    },
    warning: {
      icon: <Ionicons name="warning" size={22} color={isDark ? '#FBBF24' : '#D97706'} />,
      backgroundColor: isDark ? '#92400E' : '#FFFBEB',
      borderColor: isDark ? '#D97706' : '#F59E0B',
      shadowColor: '#F59E0B',
      progressColor: isDark ? '#FBBF24' : '#F59E0B',
      iconBackgroundColor: isDark ? '#B45309' : '#FEF3C7',
      headingColor: isDark ? '#FDE68A' : '#92400E',
      messageColor: isDark ? '#FBBF24' : '#B45309',
    },
  };

  const config = typeConfig[type];

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    const width = interpolate(progress.value, [0, 1], [0, screenWidth - 32]);
    return {
      width,
    };
  });

  const iconContainerStyle = useAnimatedStyle(() => {
    const rotate = interpolate(opacity.value, [0, 1], [180, 0]);
    return {
      transform: [{ rotate: `${rotate}deg` }],
    };
  });

  const hideToast = useCallback(() => {
    opacity.value = withTiming(0, { duration: 300 });
    translateY.value = withTiming(-50, { duration: 300 });
    scale.value = withTiming(0.8, { duration: 300 }, (isFinished) => {
      if (isFinished) {
        runOnJS(onClose)(id);
      }
    });
  }, [id, onClose, opacity, scale, translateY]);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    translateY.value = withSpring(0, {
      damping: 20,
      stiffness: 300,
    });
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    });

    progress.value = withTiming(1, { duration });

    const timer = setTimeout(() => {
      hideToast();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, hideToast, opacity, progress, scale, translateY]);

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          backgroundColor: config.backgroundColor,
          borderRadius: 16,
          marginHorizontal: 8,
          marginBottom: 8,
          elevation: 8,
          borderWidth: 1,
          borderColor: config.borderColor + '20',
        },
      ]}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: 3,
          backgroundColor: config.progressColor + '20',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          marginHorizontal: 10,
        }}>
        <Animated.View
          style={[
            progressStyle,
            {
              height: 3,
              backgroundColor: config.progressColor,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 20,
            },
          ]}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          padding: 10,
          paddingRight: 16,
        }}>
        <Animated.View
          style={[
            iconContainerStyle,
            {
              backgroundColor: config.iconBackgroundColor,
              borderRadius: 12,
              padding: 8,
              marginRight: 16,
              marginTop: 2,
            },
          ]}>
          {config.icon}
        </Animated.View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: config.headingColor,
              marginBottom: 4,
              letterSpacing: -0.2,
            }}>
            {heading}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: config.messageColor,
              lineHeight: 20,
              opacity: 0.9,
            }}>
            {message}
          </Text>
        </View>

        <TouchableOpacity
          onPress={hideToast}
          style={{
            padding: 8,
            marginLeft: 8,
            borderRadius: 8,
            backgroundColor: isDark ? '#FFFFFF15' : '#00000008',
          }}
          activeOpacity={0.7}>
          <Ionicons name="close" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default Toast;

import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps extends ViewProps {
  /**
   * default  – flat, no elevation, surface background
   * elevated – subtle shadow on light, slightly lighter bg on dark
   * outlined – transparent bg with a 1px border
   */
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
  ...props
}: CardProps) {
  const { colors, isDark } = useTheme();

  const bgColor: Record<CardProps['variant'] & string, string> = {
    default: colors.surface,
    elevated: colors.surface,
    outlined: 'transparent',
  };

  const borderStyle =
    variant === 'outlined' ? { borderWidth: 1, borderColor: isDark ? '#1F1F1F' : '#E8E8E8' } : {};

  const shadowStyle =
    variant === 'elevated' && !isDark
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }
      : variant === 'elevated' && isDark
        ? { borderWidth: 1, borderColor: '#1F1F1F' }
        : {};

  const paddingMap = {
    none: 0,
    sm: 12,
    md: 16,
    lg: 24,
  };

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: bgColor[variant], padding: paddingMap[padding] },
        borderStyle,
        shadowStyle,
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});

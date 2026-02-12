import React from 'react';
import { View, Text, StyleSheet, type ViewProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends ViewProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Show a small filled dot before the label */
  dot?: boolean;
}

// Per-variant: text colour, light bg, dark bg, dot colour
const VARIANT_CONFIG: Record<BadgeVariant, { color: string; lightBg: string; darkBg: string }> = {
  default: { color: '#6B7280', lightBg: '#F3F4F6', darkBg: '#1F1F1F' },
  primary: { color: '#3B82F6', lightBg: '#EFF6FF', darkBg: '#0D1525' },
  success: { color: '#10B981', lightBg: '#ECFDF5', darkBg: '#0D2A1A' },
  warning: { color: '#F59E0B', lightBg: '#FFFBEB', darkBg: '#2A1A08' },
  error: { color: '#EF4444', lightBg: '#FEF2F2', darkBg: '#2A0F0F' },
  info: { color: '#6366F1', lightBg: '#EEF2FF', darkBg: '#12122A' },
};

const SIZE_CONFIG: Record<
  BadgeSize,
  { px: number; py: number; fontSize: number; dotSize: number }
> = {
  sm: { px: 6, py: 2, fontSize: 10, dotSize: 5 },
  md: { px: 8, py: 3, fontSize: 11, dotSize: 6 },
  lg: { px: 10, py: 4, fontSize: 13, dotSize: 7 },
};

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  dot = false,
  style,
  ...props
}: BadgeProps) {
  const { isDark } = useTheme();

  const cfg = VARIANT_CONFIG[variant];
  const sz = SIZE_CONFIG[size];
  const bg = isDark ? cfg.darkBg : cfg.lightBg;

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: bg,
          paddingHorizontal: sz.px,
          paddingVertical: sz.py,
        },
        style,
      ]}
      {...props}>
      {dot && (
        <View
          style={[
            styles.dot,
            {
              width: sz.dotSize,
              height: sz.dotSize,
              borderRadius: sz.dotSize / 2,
              backgroundColor: cfg.color,
            },
          ]}
        />
      )}
      <Text
        style={{
          color: cfg.color,
          fontSize: sz.fontSize,
          fontWeight: '600',
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  dot: {
    marginRight: 5,
  },
});
